const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const { Auction } = require('../models/auction.model');
const { Transaction } = require('../models/transaction.model');
const { Customer } = require('../models/customer.model');
const { formatResponse } = require('../common/MethodsCommon');
const redisClient = require('../config/redis');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const moment = require('moment');
const mongoose = require('mongoose');
const { globalIo, getGlobalIo } = require('./socket.controller');
const { REDIS_KEYS, AUCTION_STATUS, PRODUCT_STATUS } = require('../common/constant');
const { pushAuctionToQueue } = require('../common/initializeAuctionSync');

const registerAuctionProduct = asyncHandler(async (req, res) => {
    const {
        productName,
        description,
        address,
        category,
        sellerName,
        condition,
        startingPrice,
        bidIncrement,
        auctionType,
        deposit,
        contactEmail,
        images,
        type
    } = req.body;
    const sellerId = req.user.userId;
    try {
        const uploadPromises = req.files ? req.files.map(file => {
            return new Promise((resolve, reject) => {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;

                cloudinary.uploader.upload(dataURI, {
                    folder: 'auction-products',
                    resource_type: 'auto',
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                });
            });
        }) : [];

        const imageUrls = await Promise.all(uploadPromises);
        const product = new Product({
            productName,
            description,
            address,
            category,
            seller: sellerId,
            images: imageUrls,
            condition,
            type,
            // status: 'pending'
        });
        const auction = new Auction({
            product: product._id,
            registerCustomerId: sellerId,
            title: productName,
            description,
            sellerName,
            contactEmail,
            startingPrice,
            bidIncrement,
            deposit,
            // status: 'new',
            createdBy: sellerId,

        });

        await product.save();
        await auction.save();

        res.status(201).json(formatResponse(true, {
            productId: product._id,
            auctionId: auction._id
        }, "Success"));
    } catch (error) {
        console.error('Lỗi khi đăng ký sản phẩm đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi đăng ký sản phẩm đấu giá"));
    }
});

const approveAuction = asyncHandler(async (req, res) => {
    const { auctionId, userId } = req.params;
    // const userId = req.user.userId;

    const {
        startTime,
        endTime,
        registrationOpenDate,
        registrationCloseDate,
        registrationFee,
        signupFee,
    } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy phiên đấu giá"));
    }

    if (auction.managementAction.length === 0) {
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'duyệt'});
    } else {
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'khôi phục'});
    }

    try {
        auction.startTime = startTime;
        auction.endTime = endTime;
        auction.registrationOpenDate = registrationOpenDate;
        auction.registrationCloseDate = registrationCloseDate;
        auction.registrationFee = registrationFee;
        auction.signupFee = signupFee;
        
        auction.status = AUCTION_STATUS.APPROVED;

        await auction.save();
        //Nếu như phê duyệt đấu giá trong ngày thì sẽ push nó vào list auto start
        if (new Date(startTime).getDate() == new Date().getDate())
            await pushAuctionToQueue(auction._id);

        await Product.findByIdAndUpdate(auction.product, { status: PRODUCT_STATUS.RECEIVED });

        res.status(200).json(formatResponse(true, { auctionId: auction._id }, "Phiên đấu giá đã được duyệt và kích hoạt thành công"));
    } catch (error) {
        console.error('Lỗi khi duyệt phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi duyệt phiên đấu giá"));
    }
});

const rejectAuction = asyncHandler(async (req, res) => {
    const { auctionId, userId} = req.params;
    const { reason } = req.body;
    // const userId = req.user.userId;
   

    if (!reason) {
        return res.status(400).json(formatResponse(false, null, "Vui lòng cung cấp lý do từ chối"));
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy phiên đấu giá"));
    }

    if (auction.managementAction.length === 0) {
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'từ chối'});
    } else {
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'hủy'});
    }

    try {
        auction.status = AUCTION_STATUS.REJECTED;
        auction.cancellationReason = reason;

        await auction.save();

        await Product.findByIdAndUpdate(auction.product, { status: AUCTION_STATUS.REJECTED });

        res.status(200).json(formatResponse(true, { auctionId: auction._id }, "Phiên đấu giá đã bị từ chối"));
    } catch (error) {
        console.error('Lỗi khi từ chối phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi từ chối phiên đấu giá"));
    }
});

const updateAuction = asyncHandler(async (req, res) => {
    const { auctionId, userId } = req.params;
    // const userId = req.user.userId;

    const {
        title,
        description,
        startTime,
        endTime,
        registrationOpenDate,
        registrationCloseDate,
        registrationFee,
        signupFee,
    } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy phiên đấu giá"));
    }
    try {
        auction.title = title;
        auction.description = description;
        auction.startTime = startTime;
        auction.endTime = endTime;
        auction.registrationOpenDate = registrationOpenDate;
        auction.registrationCloseDate = registrationCloseDate;
        auction.registrationFee = registrationFee;
        auction.signupFee = signupFee;
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'điều chỉnh'});

        await auction.save();

        // await Product.findByIdAndUpdate(auction.product, { status: 'pending' });

        res.status(200).json(formatResponse(true, { auctionId: auction._id }, "Phiên đấu giá đã được điều chỉnh"));
    } catch (error) {
        console.error('Lỗi khi điều chỉnh phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi điều chỉnh phiên đấu giá"));
    }
});

const endAuction = asyncHandler(async (req, res) => {
    const { auctionId, userId } = req.params;
    const { reason } = req.body;
    // const userId = req.user.userId;

    if (!reason) {
        return res.status(400).json(formatResponse(false, null, "Vui lòng cung cấp lý do đóng phiên"));
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy phiên đấu giá"));
    }

    try {
        auction.status = AUCTION_STATUS.COMPLETED;
        auction.cancellationReason = reason;
        auction.endTime = moment().toDate();
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'kết thúc'});

        await auction.save();

        // await Product.findByIdAndUpdate(auction.product, { status: 'cancelled' });

        res.status(200).json(formatResponse(true, { auctionId: auction._id }, "Phiên đấu giá đã đóng thành công"));
    } catch (error) {
        console.error('Lỗi khi đóng phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi đóng phiên đấu giá"));
    }
});

const kickCustomerOutOfAuction = asyncHandler(async (req, res) => {
    const { auctionId, customerId, userId } = req.params;

    const auction = await Auction.findById(auctionId)
    if(!auction){
        return res.status(400).json(formatResponse(false, null, "Không tìm thấy Auction"));
    }

    const userIndex = auction.registeredUsers.findIndex(
        (user) => user.customer && user.customer.toString() === customerId.toString()
    );

    if (userIndex === -1) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy khách hàng trong phòng đấu giá"));
    }

    try {
        auction.registeredUsers.splice(userIndex, 1);
        auction.managementAction.push({ timeLine: new Date(), userBy: userId, action: 'xóa khách hàng khỏi'});
        await auction.save();

        const populatedAuction = await Auction.findById(auction._id)
        .populate('product')
        .populate({
            path: 'managementAction.userBy',
            populate: {
                path: 'rolePermission',
                populate: [
                    { path: 'role', },
                    { path: 'permissions', },
                ],
            },
        })
        .populate({
            path: 'registeredUsers.customer',
        });
        
        const data = {
            ...populatedAuction.toObject(),
            customerRemove: customerId,
        }
        
        res.status(200).json(formatResponse(true,data,"Khách hàng đã được loại khỏi phòng đấu giá"));
    } catch (error) {
        console.error("Lỗi khi loại khách hàng khỏi phòng đấu giá:", error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi loại khách hàng khỏi phòng đấu giá"));
    }
});

const deleteHistoryManagerAuction = asyncHandler(async (req, res) => {
    const { auctionId, managementActionId} = req.params;

    const auction = await Auction.findById(auctionId)
        
    if(!auction){
        return res.status(400).json(formatResponse(false, null, "Không tìm thấy Auction"));
    }

    const managementActionIndex = auction.managementAction.findIndex(
        (managementAction) => managementAction._id && managementAction._id.toString() === managementActionId.toString()
    );
    
    if (managementActionIndex === -1) {
        return res.status(404).json(formatResponse(false, null, "Không tìm thấy lịch sử quản lí đấu giá"));
    }

    try {
        auction.managementAction.splice(managementActionIndex, 1);
        await auction.save();

        const populatedAuction = await Auction.findById(auction._id)
        .populate('product')
        .populate({
            path: 'managementAction.userBy',
            populate: {
                path: 'rolePermission',
                populate: [
                    {
                        path: 'role',
                    },
                    {
                        path: 'permissions',
                    },
                ],
            },
        })
        .populate({
            path: 'registeredUsers.customer',
        });
        
        const data = {
            ...populatedAuction.toObject(),
            managementActionRemove: managementActionId,
        }
        
        res.status(200).json(formatResponse(true,data,"Lịch sử quản lí đấu giá đã được xóa"));
    } catch (error) {
        console.error("Lỗi khi xóa lịch sử quản lí đấu giá:", error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi xóa lịch sử quản lí đấu giá"));
    }
});

const getAuctionDetailsByID = asyncHandler(async (req, res) => {
    const {id_Auction} = req.params;

    try {
        const auction = await Auction.findById(id_Auction)
        .populate('product') 
        .populate({
            path: 'managementAction.userBy',
            populate: {
            path: 'rolePermission',
            populate: [
                {
                path: 'role', 
                },
                {
                path: 'permissions', 
                },
            ],
            },
        })
        .populate({
            path: 'registeredUsers.customer',
        });

        if(!auction){
            return res.status(400).json(formatResponse(false, null, "Không tìm thấy Auction"));
        }
        const data = {
            ...auction.toObject(),
            
        }
        res.status(200).json(formatResponse(true, data, "Lấy chi tiết phiên đấu giá thành công"));
    } catch (error) {
        console.log('Lỗi khi lấy chi tiết phiên đấu giá: ', error.messager)
        res.status(400).json(formatResponse(false, null, "Lấy chi tiết phiên đấu giá thất bại"));
    }
})

//Get by slug
const getAuctionDetails = asyncHandler(async (req, res) => {
    const { auctionSlug } = req.params;
    const { viewed } = req.query;
    
    try {
        let pipeline = [];
        if (!JSON.parse(viewed || 'false')) {//Check số lượng người xem sản phẩm
            await Auction.updateOne(
                { slug: auctionSlug }, 
                { $inc: { viewCount: 1 } } // Tăng currentViews lên 1
            );
        }
        pipeline.push(
            {
                $match: { slug: auctionSlug }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            });

        pipeline.push({
            $sort: { createdAt: -1 }
        });

        pipeline.push(
            {
                $project: {
                    //Product
                    productName: "$product.productName",
                    productImages: "$product.images",
                    productDescription: "$product.description",
                    productAddress: "$product.address",

                    //Auction
                    title: 1,
                    description: 1,
                    contactEmail: 1,
                    
                    currentViews: 1,
                    viewCount: 1,
                    sellerName: 1,
                    startingPrice: 1,
                    currentPrice: 1,
                    startTime: 1,
                    endTime: 1,
                    bidIncrement: 1,
                    registrationOpenDate: 1,
                    registrationCloseDate: 1,
                    deposit: 1,
                    registrationFee: 1,
                    signupFee: 1,
                    registeredUsers: {
                        $map: {
                            input: "$registeredUsers",
                            as: "registeredUsers",
                            in: "$$registeredUsers.customer"
                        }
                    },
                    winner: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    approvalTime: 1,
                }
            },
            {
                $limit: 1
            }
        );
        const auctions = await Auction.aggregate(pipeline);
        res.status(200).json(formatResponse(true, auctions[0], ""));
    } catch (error) {
        console.error('Lỗi khi lấy thông phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi lấy danh sách phiên đấu giá"));
    }
});
//Auction nổi bật(hightlight)
const getAuctionOutstanding = asyncHandler(async (req, res) => {
    try {
        const { limit = 10, page = 1, status } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10); 
        const skip = (parsedPage - 1) * parsedLimit; 

        let pipeline = [
            {
                $lookup: { 
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $sort: { viewCount: -1 } 
            },
            {
                $skip: skip 
            },
            {
                $limit: parsedLimit 
            },
            {
                $project: { 
                    // Product
                    productName: "$product.productName",
                    productImages: "$product.images",
                    productDescription: "$product.description",
                    productAddress: "$product.address",

                    // Auction
                    currentViews: 1,
                    sellerName: 1,
                    startingPrice: 1,
                    startTime: 1,
                    bidIncrement: 1,
                    registrationOpenDate: 1,
                    registrationCloseDate: 1,
                    deposit: 1,
                    registrationFee: 1,
                    signupFee: 1,
                }
            }
        ];
        if (status) {
            pipeline.push({
                $match: { status: status }
            });
        }

        const auctions = await Auction.aggregate(pipeline); 
        res.status(200).json(formatResponse(true, auctions, ""));
    } catch (error) {
        console.error('Lỗi khi lấy thông tin phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi lấy danh sách phiên đấu giá"));
    }
});
const listAuctions = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    try {
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        let pipeline = [];

        if (status) {
            pipeline.push({
                $match: { status }
            });
        }
        pipeline.push(
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            }
        ); 

        pipeline.push(
            {
              $lookup: {
                from: 'customers', 
                localField: 'registeredUsers.customer', 
                foreignField: '_id', 
                as: 'customerDetails',
              },
            },
        );

        pipeline.push(
            {
                $lookup: {
                    from: 'customers',
                    localField: 'winner',
                    foreignField: '_id',
                    as: 'customerwinner'
                }
            },
            {
                $unwind: {
                    path: '$customerwinner',
                    preserveNullAndEmptyArrays: true // Giữ lại tài liệu nếu không có dữ liệu customer
                }
            }
        ); 

        pipeline.push(
            {
              $lookup: {
                from: 'users', 
                localField: 'managementAction.userBy', 
                foreignField: '_id', 
                as: 'userDetails',
              },
            },
            
        );

        
        
            
        pipeline.push({
            $sort: { createdAt: -1 }
        });
        pipeline.push(
            { $skip: (pageInt - 1) * limitInt },
            { $limit: limitInt }
        );

        const auction = await Auction.findOne();
        const registeredUsersCount = auction?.registeredUsers?.length || 0;
        const totalAuctions = await Auction.countDocuments(status ? { status } : {});
        pipeline.push({
            $project: {
                productName: "$product.productName",
                productImages: "$product.images",
                productDescription: "$product.description",
                productAddress: "$product.address",
                productCategory: "$product.category",
                productCondition: "$product.condition",
                productType: "$product.type",
                productStatus: "$product.status",
                productCreate: "$product.createdAt",

                slug: 1,
                title: 1,
                description: 1,
                contactEmail: 1,
                sellerName: 1,   
                startTime: 1,
                endTime: 1,            
                startingPrice: 1,
                currentPrice: 1,
                currentViews: 1,
                viewCount: 1,
                bidIncrement: 1,
                registrationOpenDate: 1,
                registrationCloseDate: 1,
                deposit: 1,
                registrationFee: 1,
                signupFee: 1,
                winner: "$customerwinner.fullName",
                winningPrice: 1,

                createdAt: 1,
                updatedAt: 1,
                managementAction: 1,
            
                userDetails: 1,
                status: status,
                cancellationReason: 1,

                registeredUsers: 1,
                customerDetails: 1,
                username: "$customerwinner.username",
                userCode: "$customerwinner.userCode",
                email: "$customerwinner.email",
                fullName: "$customerwinner.fullName",
                address: "$customerwinner.address",
                phoneNumber: "$customerwinner.phoneNumber",
                avatar: "$customerwinner.avatar",
                IndentifyCode: "$customerwinner.IndentifyCode",
                createdCustomerAt: "$customerwinner.createdAt",
            }
        });
        const auctions = await Auction.aggregate(pipeline);
        res.status(200).json(formatResponse(true, {
            docs: auctions,
            total: totalAuctions,
            page: pageInt,
            limit: limitInt,
        }, ""));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi lấy danh sách phiên đấu giá"));
    }
});

//Đấu giá đang diễn ra
const ongoingList = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    try {
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        let pipeline = [];

        pipeline.push(
            {
                $match: { status: AUCTION_STATUS.ACTIVE }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $lookup: {
                    from: 'bidhistories',
                    localField: '_id',
                    foreignField: 'auction',
                    as: 'bidshistory'
                }
            },
            {
                $unwind: '$product'
            }
        );

        pipeline.push(
            {
              $lookup: {
                from: 'customers', 
                localField: 'registeredUsers.customer', 
                foreignField: '_id', 
                as: 'customerDetails', 
              },
            },
            // {
            //   $unwind: {
            //     path: '$customerDetails', // Tách từng phần tử trong mảng `customerDetails`
            //     preserveNullAndEmptyArrays: true, // Đảm bảo giữ tài liệu gốc nếu không tìm thấy match
            //   },
            // },
            
        );
        
        pipeline.push(
            {
                $lookup: {
                    from: 'customers',
                    localField: 'winner',
                    foreignField: '_id',
                    as: 'customerwinner'
                }
            },
            {
                $unwind: {
                    path: '$customerwinner',
                    preserveNullAndEmptyArrays: true // Giữ lại tài liệu nếu không có dữ liệu customer
                }
            }
        ); 
            
        pipeline.push(
            {
                $addFields: {
                    highestBid: { $cond: { if: { $gt: [{ $size: "$bidshistory" }, 0] }, then: { $max: "$bidshistory.amount" }, else: null } },
                    timeRemain: { $subtract: ["$endTime", new Date()] } // Tính thời gian còn lại
                }
            }
        );

        pipeline.push({
            $sort: { createdAt: -1 }
        });

        pipeline.push(
            { $skip: (pageInt - 1) * limitInt },
            { $limit: limitInt }
        );

        const totalAuctions = await Auction.countDocuments(status ? { status } : {});
        pipeline.push({
            $project: {
                productName: "$product.productName",
                productImages: "$product.images",
                productDescription: "$product.description",
                productAddress: "$product.address",
                productCategory: "$product.category",
                productCondition: "$product.condition",
                productStatus: "$product.status",
                productCreate: "$product.createdAt",

                slug: 1,
                title: 1,
                description: 1,
                contactEmail: 1,
                sellerName: 1,     
                startTime: 1,
                endTime: 1,          
                startingPrice: 1,
                currentPrice: 1,
                currentViews: 1,
                viewCount: 1,
                bidIncrement: 1,
                registrationOpenDate: 1,
                registrationCloseDate: 1,
                deposit: 1,
                registrationFee: 1,
                signupFee: 1,
                winner: "$customerwinner.fullName",
                winningPrice:1,
                participants: 1,

                createdAt: 1,
                updatedAt: 1,
                managementAction: 1,
                status: status,
                cancellationReason: 1,

                registeredUsers: 1,
                customerDetails: 1,
                username: "$customer.username",
                userCode: "$customer.userCode",
                email: "$customer.email",
                fullName: "$customer.fullName",
                address: "$customer.address",
                phoneNumber: "$customer.phoneNumber",
                avatar: "$customer.avatar",
                IndentifyCode: "$customer.IndentifyCode",
                createdCustomerAt: "$customer.createdAt",

            }
        });
        const auctions = await Auction.aggregate(pipeline);
        const resFormat = await Promise.all(auctions?.map(async (item) => {
            try {
                // Lấy dữ liệu room từ Redis
                const roomCache = await redisClient.hGet(REDIS_KEYS.AUCTION_ROOM(item._id), 'auction');
                
                // Nếu không tìm thấy dữ liệu của room, skip room này
                if (!roomCache) {
                    return false;
                }
                
                // Lấy danh sách bid từ Redis
                const bidHistory = await redisClient.lRange(REDIS_KEYS.BID_HISTORY(item._id), 0, -1);
                const bidList = bidHistory.map(bid => {
                    try {
                        return JSON.parse(bid);
                    } catch (e) {
                        console.error('Error parsing bid data', e);
                        return null;
                    }
                }).filter(bid => bid !== null);
        
                const highestBid = bidList.length ? Math.max(...bidList.map(item => item.bidAmount)) : 0;
                item.highestBid = highestBid;
        
                // Lấy thông tin room từ socket
                const io = getGlobalIo();
                const roomCurrent = io && io.sockets.adapter.rooms.get(item._id?.toString());
                if (roomCurrent) {
                    const clients = Array.from(roomCurrent);
                    item.participants = clients;
                } else {
                    item.participants = [];
                }
                return {...item};
            } catch (error) {
                console.error('Error processing auction room', error);
                return false;
            }
        }));
        
        const validResFormat = resFormat.filter(item => item !== false);
        
        res.status(200).json(formatResponse(true, {
            docs: validResFormat,
            total: totalAuctions,
            page: pageInt,
            limit: limitInt,
        }, ""));
        
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi lấy danh sách phiên đấu giá"));
    }
});

//Check customer có trong danh sách đăng ký đấu giá hay không
const checkValidAccess = asyncHandler(async (req, res) => {
    const customerId = req.user.userId;
    const {auctionId}=req.params
    console.log(customerId)
    try {
        const auction = await Auction.findOne({
            _id:auctionId,
            status: AUCTION_STATUS.ACTIVE,
            startTime: { $lte: new Date() },
            endTime: { $gte: new Date() },
            'registeredUsers': {
                $elemMatch: {
                    customer: customerId,
                    status: 'active',
                    // transaction: { $exists: true }
                }
            }
        }).select('registeredUsers.$');
        console.log(auction)
        if (auction && auction.registeredUsers.length > 0) {
            res.status(200).json(formatResponse(true, { allow: true }, "Allow access"));
        } else {
            res.status(200).json(formatResponse(true, { allow: false, viewOnly: true }, "Allow access: View only"));
        }
    } catch (error) {
        console.error('Error checking auction access:', error);
        res.status(500).json(formatResponse(false, null, "An error occurred while checking auction access"));
    }
});

// Lấy thông tin phiên đấu giá để confirm 
const getAuctionComfirmInfo = asyncHandler(async (req, res) => {
    const { auctionId, customerId, productId } = req.body;

	const TransactionSumQuery = await Transaction.aggregate([
		{
			$match: {
				$and: [
					{ userId: new mongoose.Types.ObjectId(customerId) },
					{ auctionId: new mongoose.Types.ObjectId(auctionId) },
				],
			},
		},
		{
			$group: {
				_id: {
					userId: '$userId',
					auctionId: '$auctionId',
				},
				totalAmount: { $sum: '$amount' },
			},
		},
		{
			$project: {
				totalAmount: 1,
				_id: 0,
			},
		},
		{
			$limit: 1,
		},
	]).then((result) => result[0]);

	const result = await Promise.all([
		Auction.findById(auctionId, { bids: 0, managementAction: 0, __v: 0 }),
		Customer.findById(customerId, { password: 0, __v: 0 }),
		Product.findById(productId, { __v: 0 }),
		TransactionSumQuery,
	]).then(([auction, customer, product, { totalAmount }]) => {
		return {
			auction,
			customer,
			product,
			isPaied: totalAmount === (auction.winningPrice + auction.registrationFee),
			missingAmount: (auction.winningPrice + auction.registrationFee) - totalAmount,
		};
	});

	return res.json(formatResponse(true,result,'Successfully'));
});

//Update status
const updateStatusAuction = asyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const { status } = req.body;
    try {
        await Auction.findByIdAndUpdate(auctionId, { status })
        res.status(200).json(formatResponse(true, {}, ""));
    } catch (error) {
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi cập nhật trạng thái"));
    }
});

const getMyAuctioned = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const sellerId = req.user.userId;

    try {
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const query = {
            registerCustomerId: sellerId,
            status: { $in: Object.values(AUCTION_STATUS) }
        };
        const auctions = await Auction.find(query)
            .populate({
                path: 'product',
                // select: 'productName images'
            })
            .populate(
                {
                    path: 'registerCustomerId',
                    // select: 'username '
                })
            .select('product title winningPrice winnerBankInfo cancellationReason deposit startingPrice signupFee registrationFee startTime endTime status')
            .skip((pageInt - 1) * limitInt)
            .limit(limitInt);
        
        res.status(200).json(formatResponse(true, {
            docs: auctions,
            page: pageInt,
            limit: limitInt,
        }, ""));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiên đấu giá:', error);
        res.status(500).json(formatResponse(false, null, "Đã xảy ra lỗi khi lấy danh sách phiên đấu giá"));
    }
});

const updateBankInfo = asyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const { bankInfo } = req.body;
  
    try {
      const auction = await Auction.findById(auctionId);
  
      if (!auction) {
        return res.status(404).json(formatResponse(false, null, "Auction not found"));
      }
  
      // Kiểm tra trạng thái chỉ cho phép cập nhật nếu auction thành công
      if (auction.status !== AUCTION_STATUS.WINNER_PAYMENTED) {
        return res.status(400).json(formatResponse(false, null, "Cannot update bank info for this auction"));
      }
  
      auction.winnerBankInfo = bankInfo;
      auction.status = AUCTION_STATUS.DONE;
      await auction.save();
  
      res.status(200).json(formatResponse(true, auction, "Bank info updated successfully"));
    } catch (error) {
      console.error('Error updating bank info:', error);
      res.status(500).json(formatResponse(false, null, "Failed to update bank info"));
    }
});
  
module.exports = {
    registerAuctionProduct,
    approveAuction,
    rejectAuction,
    listAuctions,
    getAuctionDetailsByID,
    getAuctionDetails,
    getAuctionOutstanding,
    ongoingList,
    checkValidAccess,
    updateAuction,
    endAuction,
    kickCustomerOutOfAuction,
    getAuctionComfirmInfo,
    deleteHistoryManagerAuction,
    getMyAuctioned,
    updateBankInfo,
    updateStatusAuction
};