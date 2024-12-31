const asyncHandle = require('express-async-handler');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const { User } = require('../models/user.model');
const { RolePermission } = require('../models/Role&Permission');
const { formatResponse } = require('../common/MethodsCommon');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/Authentication')
const { sendEmail } = require("../utils/email")
const { EmailType } = require("../common/constant")
const redisClient = require("../config/redis")
const { parseDuration, parseDurationToHumanFormat } = require("../utils/time");


const employeeLogin = asyncHandle(async (req, res) => {
    const { username, password } = req.body;

    // Find employee by username
    const employee = await User.findOne({ username }).populate({
        path: 'rolePermission', 
        populate: {
          path: 'role',        
          select: 'name'        
        }
      })
      .populate({
        path: 'rolePermission',
        populate: {
          path: 'permissions',   
          select: 'key name'         
        }
      });

    
    if (!employee) {
        return res.status(401).json(formatResponse(false, null, "Invalid username or password"));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.hashedPassword);
    if (!isMatch) {
        return res.status(401).json(formatResponse(false, null, "Invalid username or password"));
    }

    // Create JWT access token & refresh token
    const { sessionKey } = await generateRefreshToken(employee._id, undefined, true);
    const accessToken = generateAccessToken(employee._id, sessionKey);
    res.setHeader('x-new-access-token', accessToken);
      
    // Lưu accessToken vào cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: false,          // Chỉ cho phép truy cập từ server-side
        secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng https khi ở môi trường production
        maxAge: 1000 * 60 * 15,  // Cookie hết hạn sau 15 phút (cùng thời gian sống với access token)
        sameSite: 'strict',      // Bảo vệ chống tấn công CSRF
    });

    // Lưu refreshToken vào cookie
    res.cookie('refreshToken', sessionKey, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // Refresh token có thể có thời hạn dài hơn, ví dụ 30 ngày
        sameSite: 'strict',
    });

    res.cookie('username', username, {
        httpOnly: false,          // Chỉ cho phép truy cập từ server-side
        secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng https khi ở môi trường production
        maxAge: 1000 * 60 * 60 * 24, // Cookie hết hạn sau 1 ngày
        sameSite: 'strict',      // Bảo vệ chống tấn công CSRF
    });

    res.cookie('userId', employee._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // Cookie hết hạn sau 1 ngày
        sameSite: 'strict',
    });

    

    const { _id, username: employeeUsername, email, rolePermission} = employee;
    const rolePermissionId = rolePermission && rolePermission.permissions
        ? rolePermission.permissions.map(permission => permission.key)
        : [];

    res.status(200).json(formatResponse(true, { _id, employeeUsername, email,permissions: rolePermissionId, accessToken}, null));
});

const employeeSendOTPCode = asyncHandle(async (req, res) => {
    const { email } = req.body;

    // check email in DB
    const employee = await User.findOne({ email });
    if (!employee) {
        return res.status(401).json(formatResponse(false, null, "Invalid email"));
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP into Redis
    const otpExpired = parseDuration(process.env.RESET_PASSWORD_OTP_EXPIRED) / 1000; // seconds
    const otpKey = `reset_pass_otp_${employee.username}`;
    const otpValue = JSON.stringify({ otpHashed: await bcrypt.hash(otp, 10) })
    await redisClient.setEx(otpKey, otpExpired, otpValue,);


    // Send OTP
    const isSuccessed = await sendEmail(
        email,
        EmailType.RESET_PASSWORD_OTP,
        {
            otp,
            fullName: employee.fullName,
            expiryTime: parseDurationToHumanFormat(process.env.RESET_PASSWORD_OTP_EXPIRED)
        }
    );


    if (isSuccessed)
        res.status(200).json(formatResponse(true, null, "OTP sent successfully."));
    else
        res.status(500).json(formatResponse(false, null, "Failed to send OTP."));


});

const employeeResetPassword = asyncHandle(async (req, res) => {
    const { username, otp, newPassword } = req.body;

    const employee = await User.findOne({ username });
    if (!employee)
        return res.status(400).json(formatResponse(false, null, "Employee not found."))

    // validate otp 
    const value = await redisClient.get(`reset_pass_otp_${username}`);
    const { otpHashed } = value ? JSON.parse(value) : {};
    if (!otpHashed)
        return res.status(400).json(formatResponse(false, null, "OTP Invalid."));

    const isMatch = await bcrypt.compare(otp, otpHashed);
    if (!isMatch)
        return res.status(400).json(formatResponse(false, null, "OTP Invalid."));

    // change password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    employee.hashedPassword = hashedPassword;
    await employee.save();

    return res.status(200).json(formatResponse(true, null, "Password has been reseted."));
});

module.exports = { employeeLogin, employeeSendOTPCode, employeeResetPassword };
