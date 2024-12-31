const asyncHandle = require("express-async-handler");
const querystring = require("qs");
const crypto = require("crypto");
const moment = require("moment");
const { sortObject, verifySecureHash } = require("../utils/vnpay");
const { formatResponse } = require("../common/MethodsCommon");
const { Transaction } = require("../models/transaction.model");
const {
  TransactionStatus,
  VNPayResponse,
  IpnResponse,
  PaymentGateways,
  AUCTION_STATUS,
} = require("../common/constant");
const { Auction } = require("../models/auction.model");

// tạo Paymment url cảu vnpay
const vnpayCreatePaymentUrl = asyncHandle(async (req, res) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  const { amount, bankCode, auctionId, userId } = req.body;
  const transaction = await Transaction.create({
    userId: userId,
    amount: amount,
    auctionId: auctionId
  });
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  const tmnCode = process.env.vnp_TmnCode;
  const secretKey = process.env.vnp_HashSecret;
  const returnUrl = process.env.vnp_ReturnUrl;
  let vnpUrl = process.env.vnp_Url;

  let locale = req.body.language;
  if (!locale || locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = transaction._id;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + transaction._id;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  return res
    .status(200)
    .json(
      formatResponse(
        true,
        { paymentUrl: vnpUrl, transactionId: transaction._id },
        null
      )
    );
});

// sau khi pay (thành công, thất bại, hủy,..) thì url này được gọi
// trong này sẽ validate -> lưu thông tin xuống DB -> redirect đến FE
const vnpayReturn = asyncHandle(async (req, res) => {
  let vnp_Params = req.query;

  if (verifySecureHash(vnp_Params)) {
    return res
      .status(400)
      .json(formatResponse(false, undefined, "Checksum failed!"));
  }

  const transactionId = vnp_Params["vnp_TxnRef"];
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return res
      .status(400)
      .json(formatResponse(false, undefined, "Invalid transaction!"));
  }

  const VNPayAmount = vnp_Params["vnp_Amount"];
  if (transaction.amount != VNPayAmount / 100) {
    return res
      .status(400)
      .json(formatResponse(false, undefined, "Invalid amount!"));
  }

  if (transaction.status === TransactionStatus.DRAFT) {
    transaction.bankCode = vnp_Params["vnp_BankCode"];
    transaction.cardType = vnp_Params["vnp_CardType"];
    transaction.updatedAt = Date.now();

    const VNPayResponseCode = vnp_Params["vnp_ResponseCode"];
    const failureReason =
      Object.values(VNPayResponse).find(
        (item) => (item.RspCode !== "00") & (item.RspCode === VNPayResponseCode)
      )?.Message ?? undefined;

    if (failureReason) {
      transaction.failureReason = failureReason;
      transaction.status = TransactionStatus.FAILURE;
      await transaction.save();
    } else {
      //success => add user vào list register
      const auction = await Auction.findByIdAndUpdate(
        transaction.auctionId,
        {
          $push: {
            registeredUsers: {
              customer: transaction.userId, // ID của khách hàng từ transaction
              registrationTime: new Date(),     // Thời gian đăng ký
              status: 'active',     // Trạng thái mặc định
              transaction: transaction._id      // ID của giao dịch
            }
          }
        },
        { new: true }
      );

      // Cập nhật trạng thái giao dịch thành công
      transaction.status = TransactionStatus.SUCCESSED;
      await transaction.save();
    }
  }
  res.send(`
      <html>
        <body>
          <script>
            // Tạo độ trễ 3 giây (3000ms) rồi đóng tab
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
          <p>Payment successful! This tab will close automatically in 3 seconds.</p>
        </body>
      </html>
    `);
});

// API này để VNPay gọi ở background sau khi pay successed.
// mục đích: phòng khi return (callback) url không gọi được thì vẫn lưu được thông tin transaction xuống DB
const vnpayIPN = asyncHandle(async (req, res) => {
  let vnp_Params = req.query;

  if (verifySecureHash(vnp_Params)) {
    return res.json(IpnResponse.IpnFailChecksum);
  }

  const transactionId = vnp_Params["vnp_TxnRef"];
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return res.json(IpnResponse.IpnOrderNotFound);
  }

  const VNPayAmount = vnp_Params["vnp_Amount"];
  if (transaction.amount != VNPayAmount / 100) {
    return res.json(IpnResponse.IpnInvalidAmount);
  }

  if (transaction.status === TransactionStatus.DRAFT) {
    transaction.bankCode = vnp_Params["vnp_BankCode"];
    transaction.cardType = vnp_Params["vnp_CardType"];
    transaction.updatedAt = Date.now();

    const VNPayResponseCode = vnp_Params["vnp_ResponseCode"];
    const failureReason =
      Object.values(VNPayResponse).find(
        (item) => (item.code !== "00") & (item.RspCode === VNPayResponseCode)
      )?.Message ?? undefined;

    if (failureReason) {
      transaction.failureReason = failureReason;
      transaction.status = TransactionStatus.FAILURE;
      await transaction.save();

      return res.json(IpnResponse.IpnUnknownError);
    }

    transaction.status = TransactionStatus.SUCCESSED;
    await transaction.save();
    return res.json(IpnResponse.SUCCESSED);
  }
});

// có validate token nha
const vnpayTransactionDetail = asyncHandle(async (req, res) => {
  // const userId = req.user.userId;

  const transaction = await Transaction.findOne({
    _id: req.params.transactionId,
    // userId: userId,
    paymentGateway: PaymentGateways.VNPAY,
  });

  if (!transaction) {
    return res
      .status(404)
      .json(formatResponse(false, undefined, "Not found Transaction"));
  }
  return res.status(200).json(formatResponse(true, transaction, undefined));
});

// có validate token nha
const vnpayTransactionLog = asyncHandle(async (req, res) => {
  const userId = req.user.userId;

  const transactions = await Transaction.find({
    userId: userId,
    paymentGateway: PaymentGateways.VNPAY,
  });

  return res
    .status(200)
    .json(formatResponse(false, transactions ?? [], undefined));
});

module.exports = {
  vnpayCreatePaymentUrl,
  vnpayReturn,
  vnpayIPN,
  vnpayTransactionDetail,
  vnpayTransactionLog,
};
