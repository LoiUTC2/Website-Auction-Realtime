const cron = require('node-cron');
const Bull = require('bull');
const { Auction, BidHistory } = require('../models/auction.model');
const { Notification } = require('../models/notification.model');
const redisClient = require('../config/redis');
const { REDIS_KEYS, EmailType, NotificationType, AUCTION_STATUS } = require('./constant');
const { endAuction } = require('../controllers/socket.controller');
const { sendEmail } = require('../utils/email');
const { default: mongoose } = require("mongoose");
const jwt = require('jsonwebtoken');
const { parseDurationToHumanFormat, formatTimeWithAddedSeconds, parseDuration } = require('../utils/time');


const auctionQueue = new Bull('auction-management', process.env.REDIS_URL);

const initializeAuctionSystem = async () => {
  try {
    const pendingAuctions = await Auction.find({
      status: AUCTION_STATUS.PENDING,
      startTime: { $gt: new Date() }
    }).populate('product');

    const activeAuctions = await Auction.find({
      status: AUCTION_STATUS.ACTIVE,
      endTime: { $gt: new Date() }
    }).populate('product');

    for (const auction of pendingAuctions) {
      const alreadyScheduled = await redisClient.sIsMember(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
      if (!alreadyScheduled) {
        console.log("Add auction to start queue, room:", auction._id)
        scheduleAuctionStart(auction);
        await redisClient.sAdd(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
      }
    }

    for (const auction of activeAuctions) {
      const alreadyScheduled = await redisClient.sIsMember(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
      if (!alreadyScheduled) {
        console.log("Add auction to cancel queue, room:", auction._id)
        scheduleAuctionEnd(auction);
        await redisClient.sAdd(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
      }
    }

    // Sync job mỗi ngày
    cron.schedule('0 0 * * *', async () => {
      await checkNewAuctions();
    });

  } catch (error) {
    console.error('Error:', error);
  }
};


const scheduleAuctionStart = async (auction) => {
  const timeUntilStart = auction.startTime - new Date();
  if (timeUntilStart > 0) {
    console.log("Add to queue start, auction:",auction._id)
    auctionQueue.add(
      'start-auction',
      { auctionId: auction._id },
      { delay: timeUntilStart }
    );
    await redisClient.sAdd(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
  }
};

const scheduleAuctionEnd = async (auction) => {
  const timeUntilEnd = auction.endTime - new Date();
  if (timeUntilEnd > 0) {
    console.log('Add to queue end, auction: ', auction._id, 'time remain', timeUntilEnd)
    auctionQueue.add(
      'end-auction',
      { auctionId: auction._id },
      { delay: timeUntilEnd }
    );
    await redisClient.sAdd(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());
  }
};

// check các phiên đấu giá mới
const checkNewAuctions = async () => {
  const newAuctions = await Auction.find({
    status: AUCTION_STATUS.PENDING,
    startTime: {
      $gt: new Date(),
      $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  for (const auction of newAuctions) {
    scheduleAuctionStart(auction);
  }
};

//Task implement
auctionQueue.process('start-auction', async (job) => {
  const { auctionId } = job.data;
  await activateAuction(auctionId);
});

auctionQueue.process('end-auction', async (job) => {
  const { auctionId } = job.data;
  await handleEndAuction(auctionId);
});

const activateAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId).populate('product');
    if (auction && auction.status === AUCTION_STATUS.APPROVED) {
      console.log("start auction ", auctionId);
      auction.status = AUCTION_STATUS.ACTIVE;
      await auction.save();
      await redisClient.hSet(REDIS_KEYS.AUCTION_ROOM(auctionId), 'status', 'active');
      await redisClient.hSet(REDIS_KEYS.AUCTION_ROOM(auctionId), 'auction', JSON.stringify(auction));

      // Lập lịch kết thúc
      scheduleAuctionEnd(auction);
    }
  } catch (error) {
    console.error('Error activating auction:', error);
  }
};

// Kết thúc phiên đấu giá
const handleEndAuction = async (auctionId) => {
  try {

    // Sync data bidHistory
    const { highestBidder, auctionData } = await syncFinalAuctionData(auctionId);

    //Emit auction end
    endAuction(auctionId, highestBidder);
    const auction = await Auction.findById(auctionId);
    if (auction && auction.status === AUCTION_STATUS.ACTIVE) {
      auction.status = AUCTION_STATUS.COMPLETED;
      await auction.save();
      
      //Delete cache
      await redisClient.del(REDIS_KEYS.AUCTION_ROOM(auctionId));
      await redisClient.del(REDIS_KEYS.BID_HISTORY(auctionId));
      await redisClient.del(REDIS_KEYS.AUCTION_CHAT(auctionId));
      await redisClient.sRem(REDIS_KEYS.SCHEDULED_AUCTIONS(auctionId), auctionId.toString());
    }

    // Send email notification
    await sendEmailToAuctionWinner(auctionId);
    await sendEmailToProductOwner(auctionId);
    
  } catch (error) {
    console.error('Error ending auction:', error);
  }
};

const syncFinalAuctionData = async (auctionId) => {
  try {
    let auction = await redisClient.hGetAll(REDIS_KEYS.AUCTION_ROOM(auctionId));
    let auctionData = JSON.parse(auction.auction);
    const bidList = await redisClient.lRange(REDIS_KEYS.BID_HISTORY(auctionId), 0, -1);
    let highestBidder = null;
    const bidHistoryIds = [];

    // SYNC lịch sử đấu giá
    for (const bidJson of bidList) {
      const bid = JSON.parse(bidJson);
      const bidHistory = await BidHistory.create({
        auction: auctionId,
        bidder: bid.userId,
        amount: bid.bidAmount,
        time: new Date(bid.timestamp)
      });

      bidHistoryIds.push(bidHistory._id);

      if (
        !highestBidder ||
        bid.bidAmount > highestBidder.amount ||
        (bid.bidAmount === highestBidder.amount && new Date(bid.timestamp) > new Date(highestBidder.time))
      ) {
        highestBidder = {
          userCode: bid.userCode,
          userId: bid.userId,
          amount: bid.bidAmount,
          time: new Date(bid.timestamp)
        };
      }
    }

    if (auctionData) {
      await Auction.findByIdAndUpdate(auctionId, {
        winner: highestBidder?.userId || null,
        winningPrice: highestBidder?.amount || null,
        bids: bidHistoryIds 
      });
    }

    return { highestBidder, auctionData }
  } catch (error) {
    console.error('Error syncing final auction data:', error);
  }
};

//Func handle các room được duyệt đấu giá trong ngày (không đợi qua ngày để job check)
const pushAuctionToQueue = async (auctionId) => {
  try {
    // Truy vấn auction và populate thông tin sản phẩm
    const auction = await Auction.findById(auctionId).populate('product');
    
    if (!auction) {
      console.error('Auction not found');
      return false;
    }

    const currentTime = new Date();
    const startTime = new Date(auction.startTime);
    const endTime = new Date(auction.endTime);

    // if (startTime <= currentTime && endTime > currentTime) {
    //   await activateAuction(auction._id);
    // }
    console.log('Push to queue, result: ', (startTime > currentTime && endTime > currentTime), (endTime > currentTime))
    if (startTime > currentTime && endTime > currentTime) {
      await scheduleAuctionStart(auction);
    }

    if (endTime > currentTime) {
      await scheduleAuctionEnd(auction);
    }
    await redisClient.sAdd(REDIS_KEYS.SCHEDULED_AUCTIONS(auction._id), auction._id.toString());

    return true;
  } catch (error) {
    console.error('Error scheduling auction by ID:', error);
    return false;
  }
};

const sendEmailToAuctionWinner = async (auctionId) => {
  try {
      
    const auction = await Auction.aggregate([
      { 
        $match: { 
          $and: [ 
            { "_id": new mongoose.Types.ObjectId(auctionId) },
            { "status": AUCTION_STATUS.COMPLETED } 
          ]
        } 
      },
      {
        $lookup: {
          from: "customers",
          localField: "winner",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: 1,
                username: 1,
                email: 1,
              },
            },
          ],
          as: "winningCustomer",
        },
      },
      {
        $unwind: {
          path: "$winningCustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: "$productName",
                image: {
                  $arrayElemAt: [{ $ifNull: ["$images", []] }, 0],
                },
              },
            },
          ],
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          winningPrice: 1,
          startTime: 1,
          endTime: 1,
          product: 1,
          winningCustomer: 1,
        },
      },
    ])
    .then(result => result[0]);

    if(auction == null){
      console.error('Send email to auction winner fail:', new Error("Not found auction!"));
      return;
    }

    // Generate Token
    const expiresIn = process.env.CUSTOMER_AUCTION_COMFIRM_TOKEN_EXPIRED;
    
    const token = jwt.sign(
      {
        auctionId: auction._id,
        customerId: auction.winningCustomer._id,
        productId: auction.product._id,
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: expiresIn }
    );

    // Send Email
    const isSuccessed = await sendEmail(
      auction.winningCustomer.email,
      EmailType.NOTIFY_TO_AUCTION_WINNER,
      {
        winningPrice: auction.winningPrice,
        startTime: auction.startTime,
        endTime: auction.endTime,
        product: auction.product,
        winningCustomer: auction.winningCustomer,
        confirmUrl: `${process.env.REACT_APP_CLIENT_URL}/auction/confirmation/${token}`,
        expiryTime: parseDurationToHumanFormat(expiresIn)
      }
    )
    if (!isSuccessed){
      console.error('Send email to auction winner fail:', new Error("Cannot send email!"));
      return;
    }

    // Save a Notification
    await Notification.create(new Notification({
      ownerId: auction.winningCustomer._id,
      type: NotificationType.SUCCESS,
      title: 'Chúc mừng! Bạn đã trúng đấu giá',
      message: `Bạn đã trúng đấu giá sản phẩm '${auction.product?.name}' với giá ${auction.winningPrice} VND. Vui lòng hoàn tất thanh toán trước ${formatTimeWithAddedSeconds(parseDuration(expiresIn) / 1000)}.`,
      metadata: {
        productId: auction.product._id,
        auctionId: auction._id,
      }
    }));
    
  } catch(error) {
    console.error('Send email to auction winner fail:', error);
  }
  
  
} 

const sendEmailToProductOwner = async (auctionId) => {
  try {

    const auction = await Auction.aggregate([
      { 
        $match: { 
          $and: [ 
            { "_id": new mongoose.Types.ObjectId(auctionId) },
            { "status": AUCTION_STATUS.COMPLETED } 
          ]
        } 
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: "$productName", 
                image: {
                  $arrayElemAt: [{ $ifNull: ["$images", []] }, 0],
                },
                owner: "$seller", 
              },
            },
          ],
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "product.owner", 
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                email: 1,
              },
            },
          ],
          as: "productOwner",
        },
      },
      {
        $unwind: {
          path: "$productOwner",
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $project: {
          winningPrice: 1, 
          product: 1, 
          productOwner: 1, 
        },
      },
    ])
    .then(result => result[0]);   
  
    if(auction == null){
      console.error('Send email to product owner fail:', new Error("Not found auction!"));
      return;
    }
      
    // Send Email
    const isSuccessed = await sendEmail(
      auction.productOwner.email,
      EmailType.NOTIFY_TO_PRODUCT_OWNER,
      {
        product: auction.product,
        winningPrice: auction.winningPrice,
        productOwner: auction.productOwner
      }
    )
    if (!isSuccessed){
      console.error('Send email to product owner fail:', new Error("Cannot send email!"));
      return;
    }

    // Save a Notification
    await Notification.create(new Notification({
      ownerId: auction.productOwner._id,
      type: NotificationType.INFO,
      title: 'Sản phẩm của bạn đã được đấu giá thành công',
      message: `Sản phẩm '${auction.product?.name}' đã được đấu giá thành công với giá ${auction.winningPrice} VND. Vui lòng chuẩn bị giao hàng và xác nhận với hệ thống.`,
      metadata: {
        productId: auction.product._id,
        auctionId: auction._id,
      }
    }));
    
  } catch(error) {
    console.error('Send email to product owner fail:', error);
  }
}

module.exports = {
  initializeAuctionSystem,
  pushAuctionToQueue
};