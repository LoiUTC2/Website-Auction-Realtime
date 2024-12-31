const { formatResponse } = require('../common/MethodsCommon');
const { User } = require('../models/UserModel');
const asyncHandle = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/Authentication')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng
const registerUser = asyncHandle(async (req, res) => {
    const { email, username, password } = req.body;

    // Kiểm tra xem email hoặc username đã tồn tại chưa
    const existData = await User.findOne({ $or: [{ email }, { username }] });
    if (existData) {
        return res.status(400).json(formatResponse(false, null, "Register failed! Try again with another username or email."));
    }

    // Mã hóa password và tạo user mới với userCode
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        ...req.body,
        password: hashedPassword,
    });

    return res.status(200).json(formatResponse(true, newUser, null));
});


// Đăng nhập người dùng
const loginUser = asyncHandle(async (req, res) => {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400)
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json(formatResponse(false, null, 'Invalid email or password'));
    }

    // Tạo access token và refresh token
    const { sessionKey } = await generateRefreshToken(user._id, undefined, true)
    const accessToken = generateAccessToken(user._id, sessionKey);
    res.setHeader('x-new-access-token', accessToken);
    res.status(200).json(formatResponse(true, user, null));
});

module.exports = { registerUser, loginUser }