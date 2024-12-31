const asyncHandler = require('express-async-handler');
const redisClient = require('../config/redis');
const { verifyAccessToken, verifySocketToken } = require('../middlewares/Authentication');
const { REDIS_KEYS } = require('../common/constant');

let globalIo = null;
const setGlobalIo = (io) => {
    globalIo = io;
};

const getGlobalIo = () => {
    if (!globalIo) {
        throw new Error('Socket.IO chưa được khởi tạo');
    }
    return globalIo;
};

const initializeSocket = (io) => {
    globalIo = io;
    setGlobalIo(io);
    io.use(verifySocketToken);
    io.on('connection', (socket) => {
        console.log('Connected. ID:', socket.id);
        socket.on('joinAuctionRoom', (roomId) => joinAuctionRoom(io, socket, roomId));
        socket.on('placeBid', (data) => placeBid(io, socket, data));
        socket.on('endAuction', (roomId) => endAuction(io, socket, roomId));

        socket.on('get-chat-history', (data) => getChatHistory(io, socket, data));
        socket.on('send-message', (data) => handleChatMessage(io, socket, data));

        socket.on('disconnect', () => handleDisconnect(socket));

    });
};

const joinAuctionRoom = asyncHandler(async (io, socket, roomId) => {
    const roomKey = REDIS_KEYS.AUCTION_ROOM(roomId);
    const bidHistoryKey = REDIS_KEYS.BID_HISTORY(roomId);

    try {
        socket.join(roomId);

        const [roomInfo, bidHistory] = await Promise.all([
            redisClient.hGetAll(roomKey), //Get auction data
            redisClient.lRange(bidHistoryKey, 0, -1) //Get bids history
        ]);

        if (!roomInfo || Object.keys(roomInfo).length === 0) {
            socket.emit('error', { message: 'Không tìm thấy phòng đấu giá' });
            return;
        }
        //STRING=>JSON
        let parsedBidHistory = bidHistory.map(bid => {
            try {
                return JSON.parse(bid);
            } catch (e) {
                console.log("Parse redis data failed")
                return null;
            }
        }).filter(bid => bid !== null).sort((a, b) => b.bidAmount - a.bidAmount);
        socket.emit('roomJoined', {
            roomInfo: {
                ...roomInfo,
                currentBid: parseFloat(roomInfo.currentBid || 0)
            },
            bidHistory: parsedBidHistory
        });
    } catch (error) {
        console.error('Lỗi khi tham gia phòng đấu giá:', error);
        socket.emit('error', { message: 'Không thể tham gia phòng đấu giá' });
    }
});

const placeBid = asyncHandler(async (io, socket, data) => {
    const { roomId, bidAmount } = data;
    const { userId, userCode } = socket.user;
    const roomKey = REDIS_KEYS.AUCTION_ROOM(roomId);
    const bidHistoryKey = REDIS_KEYS.BID_HISTORY(roomId);
    if (!userId || !userCode) {
        socket.emit('sessionExpire', { message: 'Session expire' });
        console.log('sessionExpire, token: ',socket.handshake.auth.token)
        return;
    }
    try {
        const room = await redisClient.hGetAll(roomKey);

        if (!room || Object.keys(room).length === 0) {
            socket.emit('error', { message: 'Phiên đấu giá không tồn tại' });
            return;
        }

        const currentBid = parseFloat(room.currentBid || 0);
        const currentTime = new Date();
        const endTime = new Date(room.endTime);

        if (currentTime >= endTime) {
            socket.emit('error', { message: 'Phiên đấu giá đã kết thúc' });
            return;
        }

        if (bidAmount <= currentBid) {
            socket.emit('error', { message: 'Giá đặt phải cao hơn giá hiện tại' });
            return;
        }

        const bidData = {
            userId,
            userCode,
            bidAmount,
            timestamp: currentTime.toISOString()
        };

        await Promise.all([
            // Update room info
            redisClient.hSet(roomKey, {
                currentBid: bidAmount.toString(),
                highestBidder: userId
            }),
            // Add to bid history
            redisClient.rPush(bidHistoryKey, JSON.stringify(bidData))
        ]);

        io.to(roomId).emit('bidUpdated', {
            ...bidData,
            currentBid: bidAmount
        });

    } catch (error) {
        console.error('Lỗi khi đặt giá:', error);
        socket.emit('error', { message: 'Không thể đặt giá' });
    }
});

const endAuction = asyncHandler(async ( roomId,highestBidder) => {

    try {
        const [roomInfo] = await Promise.all([
            redisClient.hGetAll(REDIS_KEYS.AUCTION_ROOM(roomId)),
        ]);

        // if (!roomInfo || Object.keys(roomInfo).length === 0) {
        //     globalIo.emit('error', { message: 'Phòng đấu giá không tồn tại' });
        //     return;
        // }

        globalIo.to(roomId).emit('auctionEnd', {
            roomId,
            winner: highestBidder?.userCode|| null,
            winnerId: highestBidder?.userId || null,
            winningBid: parseFloat(highestBidder?.amount),
            time: highestBidder?.time
        });

    } catch (error) {
        console.error('Lỗi khi kết thúc đấu giá:', error);
        socket.emit('error', { message: 'Không thể kết thúc đấu giá' });
    }
});

const handleDisconnect = (socket) => {
    console.log('Người dùng đã ngắt kết nối:', socket.id);
};

//-------------------Auction chat-------------------------
const getChatHistory = asyncHandler(async (io, socket, data) => {
    const chatKey = REDIS_KEYS.AUCTION_CHAT(data.roomId);

    try {
        // Lấy lịch sử chat từ Redis
        const chatHistory = await redisClient.lRange(chatKey, 0, -1);

        const parsedHistory = chatHistory.map(msg => {
            try {
                return JSON.parse(msg);
            } catch (e) {
                console.log("Parse chat message failed");
                return null;
            }
        }).filter(msg => msg !== null);

        socket.emit('chat-history', parsedHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        socket.emit('error', { message: 'Không thể lấy lịch sử chat' });
    }
});

const handleChatMessage = asyncHandler(async (io, socket, data) => {
    const { roomId, message } = data;
    const { userCode } = socket.user;
    const chatKey = REDIS_KEYS.AUCTION_CHAT(roomId);
    const roomKey = REDIS_KEYS.AUCTION_ROOM(roomId);

    try {
        const room = await redisClient.hGetAll(roomKey);
        if (!room || Object.keys(room).length === 0) {
            socket.emit('error', { message: 'Phiên đấu giá không tồn tại' });
            return;
        }

        const currentTime = new Date();
        const endTime = new Date(room.endTime);
        if (currentTime >= endTime) {
            socket.emit('error', { message: 'Phiên đấu giá đã kết thúc' });
            return;
        }

        const chatMessage = {
            userCode,
            message: message.trim(),
            timestamp: currentTime.toISOString()
        };

        await redisClient.rPush(chatKey, JSON.stringify(chatMessage));

        const timeToEnd = endTime - currentTime;
        if (timeToEnd > 0) {
            // Set thời gian tồn tại cho tin nhắn bằng với thời gian còn lại của phiên đấu giá
            await redisClient.expire(chatKey, Math.ceil(timeToEnd / 1000));
        }

        io.to(roomId).emit('new-message', chatMessage);

    } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Không thể gửi tin nhắn' });
    }
});

module.exports = {
    initializeSocket,
    endAuction,
    // getListMember,
    getGlobalIo
};