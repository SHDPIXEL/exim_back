const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser", // ✅ Correctly referencing AppUser model
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    subscription_details: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["digital", "hard", "both"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payments", PaymentSchema);
