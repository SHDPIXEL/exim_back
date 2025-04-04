const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  deviceId: String,
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LoginHistorySchema = new mongoose.Schema({
  timestamp: Date,
  ip: String,
  country: String,
  deviceId: String,
});

// App User Schema
const AppUserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    nature_business: {
      type: String,
      required: true,
    },
    subscribe_newsletter: {
      type: String,
      required: true,
    },
    // ✅ New Optional Fields
    contact_person: {
      type: String,
      required: false,
    },
    contact_person_designation: {
      type: String,
      required: false,
    },
    company_address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    confirm_password: {
      type: String,
      required: false,
    },
    active_tokens: {
      type: [TokenSchema],
      default: [],
    },
    
    // ✅ Store all login timestamps
    // ✅ Store login history with timestamps & IP addresses
    login_history: {
      type: [LoginHistorySchema],
    default: [],
    },
    resetPasswordToken: { type: String },
  },
  
  { timestamps: true }
);

const AppUser = (module.exports = mongoose.model("AppUser", AppUserSchema));
