const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { parseDuration } = require("../utils/time")
const { RefreshToken } = require('../models/user.model');
const { formatResponse } = require('../common/MethodsCommon');

// Tạo access token
function generateAccessToken(userId, sessionKey, userCode = null, expiresIn = "1h") {
    return jwt.sign({
        userId,
        sessionKey,
        userCode,
        createdAt: new Date(),
    }, process.env.JWT_SECRET, { expiresIn: expiresIn });
}

// Tạo refresh token
async function generateRefreshToken(userId, expiresIn = "7d", isRefresh = false) {

    const existingRefreshToken = await RefreshToken.findOne({ userId });
    
    if (existingRefreshToken && !isRefresh) {
        // Nếu token còn hạn, sử dụng lại
        if (existingRefreshToken.expiresAt > new Date()) {
            return { 
                refreshToken: existingRefreshToken.token, 
                sessionKey: existingRefreshToken.sessionKey 
            };
        }
    }

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hash = await bcrypt.hash(refreshToken, 10);

    const sessionKey = crypto.randomBytes(16).toString('hex'); // UUID session
    await RefreshToken.deleteMany({ userId: userId });
    await RefreshToken.create({
        token: hash,
        sessionKey: sessionKey,
        userId: userId,
        expiresAt: new Date(Date.now() + parseDuration(expiresIn)), // 7 ngày

    });

    return { refreshToken, sessionKey };
}
// Verify access token
async function verifyAccessToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(formatResponse(false, { message: 'Unauthorized' }, null));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            try {
                const decodedToken = jwt.decode(token);
                const { userId, sessionKey } = decodedToken;

                const refreshTokenRecord = await RefreshToken.findOne({ userId, sessionKey }).exec();
                if (!refreshTokenRecord || !refreshTokenRecord.token || new Date() > refreshTokenRecord.expiresAt) {
                    return res.status(401).json(formatResponse(false, { message: 'Unauthorized' }, null));
                }

                const { refreshToken: newRefreshToken, sessionKey: newSessionKey } = await generateRefreshToken(userId);
                const newAccessToken = generateAccessToken(userId, newSessionKey);
                // const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

                // await RefreshToken.findOneAndUpdate(
                //     { userId, sessionKey },
                //     {
                //         token: newRefreshTokenHash,
                //         sessionKey: newSessionKey,
                //         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                //     },
                //     { new: true }
                // );

                res.setHeader('x-new-access-token', newAccessToken);
                req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET);
                next();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return res.status(500).json(formatResponse(false, { message: 'Internal server error' }, null));
            }
        } else {
            return res.status(401).json(formatResponse(false, { message: 'Unauthorized' }, null));
        }
    }
}

// Middleware verify token cho Socket.IO
const verifySocketToken =async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return socket.emit('sessionExpire', { Authentication: false });
        }
console.log('token',token)
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                try {
                    const decodedToken = jwt.decode(token);
                    const { userId,userCode, sessionKey } = decodedToken;
                    
                    // Kiểm tra refresh token
                    const refreshTokenRecord = await RefreshToken.findOne({ userId, sessionKey }).exec();
                    if (!refreshTokenRecord || !refreshTokenRecord.token || new Date() > refreshTokenRecord.expiresAt) {
                        return socket.emit('sessionExpire', { Authentication: false });
                    }

                    // Tạo token mới
                    const { refreshToken: newRefreshToken, sessionKey: newSessionKey } = await generateRefreshToken(userId);
                    const newAccessToken = generateAccessToken(userId, newSessionKey,userCode);

                    // Cập nhật thông tin user trong socket
                    socket.user = jwt.verify(newAccessToken, process.env.JWT_SECRET);
                    
                    // Gửi token mới về client
                    socket.emit('newToken', { accessToken: newAccessToken });
                    next();
                } catch (refreshError) {
                    console.error('Lỗi khi làm mới token:', refreshError);
                    return socket.emit('sessionExpire', { Authentication: false });
                }
            } else {
                return socket.emit('sessionExpire', { Authentication: false });
            }
        }
    } catch (error) {
        return next(new Error('Lỗi xác thực'));
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifySocketToken
};
