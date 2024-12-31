const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { TransactionStatus, PaymentGateways } = require("../common/constant");

const TransactionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "VND",
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.DRAFT,
    },
    failureReason: {
      type: String,
      default: null,
    },
    bankCode: {
      type: String,
      default: null,
    },
    cardType: {
      type: String,
      default: null,
    },
    paymentGateway: {
      type: String,
      enum: Object.values(PaymentGateways),
      default: PaymentGateways.VNPAY,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

TransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = {
  Transaction: mongoose.model("Transaction", TransactionSchema),
};
