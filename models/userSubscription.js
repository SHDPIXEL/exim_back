const mongoose = require("mongoose");

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AppUser",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String, // Example: "1 year", "2 years"
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Ensure a user can't have duplicate entries for the same location
UserSubscriptionSchema.index({ userId: 1, location: 1 }, { unique: true });

const UserSubscriptions = mongoose.model("UserSubscriptions", UserSubscriptionSchema);

module.exports = UserSubscriptions;
