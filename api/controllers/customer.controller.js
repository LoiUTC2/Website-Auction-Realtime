const asyncHandle = require('express-async-handler');
const bcrypt = require('bcrypt');
const { formatResponse } = require('../common/MethodsCommon');
const { Customer } = require('../models/customer.model');
const { Auction } = require('../models/auction.model');
const { Transaction } = require('../models/transaction.model');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/Authentication');
const { sendAccountCreationOTP, sendPasswordResetOTP } = require('../utils/email');
const redisClient = require('../config/redis');
const crypto = require('crypto');

const createCustomer = asyncHandle(async (req, res) => {
    const { fullName, username, email, phoneNumber, password, status, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json(formatResponse(false, { message: "Email or OTP missing!" }, "Email or OTP missing!"));
    }

    const cachedOtp = await redisClient.get(email.toLowerCase());
    if (!cachedOtp) {
        return res.status(400).json(formatResponse(false, { message: "OTP expired or invalid!" }, "OTP expired or invalid!"));
    }

    if (cachedOtp !== otp) {
        return res.status(400).json(formatResponse(false, { message: "OTP is incorrect!" }, "OTP is incorrect!"));
    }

    const existingCustomer = await Customer.findOne({
        $or: [{ username }, { email: email.toLowerCase() }]
    });
    if (existingCustomer) {
        if (existingCustomer.username === username)
            return res.status(400).json(formatResponse(false, { message: "Username already exists!" }, "Username already exists!"));
        if (existingCustomer.email === email.toLowerCase())
            return res.status(400).json(formatResponse(false, { message: "Email already exists!" }, "Email already exists!"));
        return res.status(400).json(formatResponse(false, { message: "Account already exists!" }, "Account already exists!"));
    }
    // Lấy userCode mới nhất trong hệ thống để tạo userCode mới
    const latestUser = await Customer.findOne({ userCode: { $regex: /^ACM-N\d{4}$/ } }).sort({ createdAt: -1 });

    // Xử lý tăng mã tự động cho userCode. Quy tắc mã KH: ACM-N + 4 số tự động tăng
    let newUserCode = "ACM-N0001";
    if (latestUser && latestUser.userCode) {
        const lastCode = parseInt(latestUser.userCode.slice(5), 10); // parse 4 số cuối
        newUserCode = `ACM-N${(lastCode + 1).toString().padStart(4, '0')}`;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
        fullName,
        username,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        status,
        userCode: newUserCode
    });

    const { password: _, ...customerResponse } = customer.toObject();
    await redisClient.del(email.toLowerCase());

    res.status(201).json(formatResponse(true, customerResponse, "Customer created successfully!"));
});

const sendOTPCreateAccount = asyncHandle(async (req, res) => {
    const { email } = req.body;
    if (!email)
        res.status(400).json(formatResponse(false, { message: "Email invalid!" }, "Email invalid!"));
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer)
    {
        res.status(400).json(formatResponse(false, { message: "Email already exists!" }, "Email already exists!"));
    }
    const { otp, success } = await sendAccountCreationOTP(email);
    if (!success)
        res.status(400).json(formatResponse(false, { message: "Send otp failed!" }, "Send otp failed!"));
    await redisClient.setEx(email, 180, otp);
    res.status(200).json(formatResponse(true, { message: "Send OTP successfully!" }, "Send OTP successfully!"));
});

const getCustomerById = asyncHandle(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json(formatResponse(false, null, "Customer not found"));
    }

    const { hashedPassword: _, ...customerResponse } = customer.toObject();
    delete customerResponse.password
    res.status(200).json(formatResponse(true, customerResponse, "Customer retrieved successfully!"));
});

const updateCustomer = asyncHandle(async (req, res) => {
    const { fullName, username, email, phoneNumber, password, status } = req.body;

    const updates = { fullName, username, email: email.toLowerCase(), phoneNumber, status }; // Normalize email
    if (password) {
        updates.hashedPassword = await bcrypt.hash(password, 10);
    }

    const customer = await Customer.findOneAndUpdate({ username: username }, updates, {
        new: true,
        runValidators: true
    });
    if (!customer) {
        return res.status(404).json(formatResponse(false, null, "Customer not found"));
    }

    const { hashedPassword: _, ...customerResponse } = customer.toObject();
    res.status(200).json(formatResponse(true, customerResponse, "Customer updated successfully!"));
});

const deleteCustomer = asyncHandle(async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
        return res.status(404).json(formatResponse(false, null, "Customer not found"));
    }

    res.status(200).json(formatResponse(true, null, "Customer deleted successfully!"));
});

const loginCustomer = asyncHandle(async (req, res) => {
    const { username, password } = req.body;

    const customer = await Customer.findOne({
        $or: [{ username }, { email: username.toLowerCase() }]
    });

    if (!customer) {
        return res.status(400).json(formatResponse(false, null, "Invalid username or password"));
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
        return res.status(400).json(formatResponse(false, null, "Invalid username or password"));
    }

    // Tạo access token và refresh token
    const { sessionKey } = await generateRefreshToken(customer._id, undefined, true)
    const accessToken = generateAccessToken(customer._id, sessionKey, customer.userCode);
    res.setHeader('x-new-access-token', accessToken);
    res.status(200).json(formatResponse(true, {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        username: customer.username
    }, null));

});

//Send otp=>Verify otp=>change password
const sendOTPForPasswordReset = asyncHandle(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(formatResponse(false, { message: "Email is required!" }, "Email is required!"));
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
        return res.status(400).json(formatResponse(false, { message: "No account found with this email!" }, "No account found with this email!"));
    }

    const { success, otp } = await sendPasswordResetOTP(email);

    if (!success) {
        return res.status(500).json(formatResponse(false, { message: "Failed to send OTP!" }, "Failed to send OTP!"));
    }

    await redisClient.setEx(`pwd_reset_${email.toLowerCase()}`, 180, otp);

    res.status(200).json(formatResponse(true, { message: "Password reset OTP sent successfully!" }, "Password reset OTP sent successfully!"));
});

const verifyOTP = asyncHandle(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json(formatResponse(false, { message: "Email and OTP are required!" }, "Email and OTP are required!"));
    }

    const cachedOtp = await redisClient.get(`pwd_reset_${email.toLowerCase()}`);
    if (!cachedOtp) {
        return res.status(400).json(formatResponse(false, null, "OTP expired or invalid!"));
    }

    if (cachedOtp !== otp) {
        return res.status(400).json(formatResponse(false, null, "Incorrect OTP!"));
    }

    // OTP chính xác => tạo một token mới cho bước đổi mật khẩu, xóa otp cũ
    const resetToken = crypto.randomBytes(20).toString('hex');
    await redisClient.setEx(`pwd_reset_token_${email.toLowerCase()}`, 300, resetToken);
    await redisClient.del(`pwd_reset_${email.toLowerCase()}`);

    res.status(200).json(formatResponse(true, { key: resetToken }, "OTP verified successfully!"));
});

const resetPassword = asyncHandle(async (req, res) => {
    const { email, otpKey, newPassword } = req.body;

    if (!email || !otpKey || !newPassword) {
        return res.status(400).json(formatResponse(false, null, "Invalid data. Try again!"));
    }

    const cachedToken = await redisClient.get(`pwd_reset_token_${email.toLowerCase()}`);
    if (!cachedToken || cachedToken !== otpKey) {
        return res.status(400).json(formatResponse(false, null, "Cannot reset password!"));
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
        return res.status(404).json(formatResponse(false, { message: "Customer not found!" }, "Customer not found!"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.password = hashedPassword;
    await customer.save();

    await redisClient.del(`pwd_reset_token_${email.toLowerCase()}`);

    res.status(200).json(formatResponse(true, { message: "Password reset successfully!" }, "Password reset successfully!"));
});


//Lịch sử đăng ký
const getUserRegisteredAuctions = asyncHandle(async (req, res) => {
    const id = req.user.userId; 

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "User ID is required in query parameter.",
        });
    }

    try {
        const auctions = await Auction.find({
            'registeredUsers.customer': id,
        })
            .populate('registeredUsers.transaction', 'amount currency') // Lấy số tiền từ bảng Transaction
            .exec();

        // Xử lý dữ liệu trả về
        const formattedAuctions = auctions.map((auction) => {
            const userRegistration = auction.registeredUsers.find(
                (user) => user?.customer?.toString() === id
            );
            //Nếu user là người chiến thắng
            const isWin= auction.winner?.toString() == id
            
            return {
                _id: auction._id,
                title: auction.title,
                slug: auction.slug,
                startTime: auction.startTime,
                endTime: auction.endTime,
                status: userRegistration.status,
                currentPrice: auction.currentPrice,
                registrationTime: userRegistration?.registrationTime || null,
                registrationFee: userRegistration?.transaction?.amount || 0, // Số tiền đăng ký
                isWin: isWin,
                winningPrice: isWin ? auction.winningPrice : null

            };
        });

        if (formattedAuctions.length === 0) {
            return res.status(404).json({
                success: true,
                data: [],
                message: "No registered auctions found for the user.",
            });
        }

        res.status(200).json({
            success: true,
            data: formattedAuctions,
            message: "Registered auctions retrieved successfully.",
        });
    } catch (error) {
        console.error("Error fetching registered auctions:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching registered auctions.",
        });
    }
});

//Lịch sử giao dịch 
const getTransactionHistory = asyncHandle(async (req, res) => {
    const userId = req.user.userId; // Lấy user ID từ token hoặc request

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required.",
        });
    }

    try {
        // Lấy danh sách giao dịch
        const transactions = await Transaction.find({ userId })
            .populate('auctionId')
            .sort({ createdAt: -1 });

        if (transactions.length === 0) {
            return res.status(404).json({
                success: true,
                data: [],
                message: "No transactions found for the user.",
            });
        }

        // Format dữ liệu trả về
        const formattedTransactions = transactions.map((transaction) => ({
            _id: transaction._id,
            auctionId: transaction?.auctionId?._id,
            auctionTitle: transaction.auctionId?.title,
            auctionStartTime: transaction.auctionId?.startTime,
            auctionEndTime: transaction.auctionId?.endTime,
            product: transaction.auctionId?.product,
            title: transaction.auctionId?.title,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            createdAt: transaction.createdAt,
        })).filter(x => !!x.auctionId);

        res.status(200).json({
            success: true,
            data: formattedTransactions,
            message: "Transaction history retrieved successfully.",
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching transaction history.",
        });
    }
});

module.exports = {
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loginCustomer,
    sendOTPCreateAccount,
    sendOTPForPasswordReset,
    resetPassword,
    verifyOTP,
    getUserRegisteredAuctions,
    getTransactionHistory
};
