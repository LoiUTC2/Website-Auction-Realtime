const express = require("express");
const router = express.Router();

const {
  vnpayCreatePaymentUrl,
  vnpayReturn,
  vnpayIPN,
  vnpayTransactionDetail,
  vnpayTransactionLog,
} = require("../controllers/payment.controller");
const { verifyAccessToken } = require('../middlewares/Authentication');

router.post("/vnpay/create_payment_url", vnpayCreatePaymentUrl);
router.get("/vnpay/return", vnpayReturn);
router.get("/vnpay/ipn", vnpayIPN);
router.get("/vnpay/detail/:transactionId", vnpayTransactionDetail);
router.get("/vnpay/log", verifyAccessToken, vnpayTransactionLog);
router.get("/vnpay/log", verifyAccessToken, vnpayTransactionLog);

module.exports = router;
