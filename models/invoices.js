const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true, required: true }, // Unique Invoice ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },
    orderId: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    amountInWords: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    invoiceTime: { type: String, required: true },
    transactionId: { type: String, required: true },
    locations: { type: String, required: true },
    durations: { type: String, required: true },
    expiryDates: { type: String, required: true },
    prices: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    customerAddress: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoices", InvoiceSchema);
