const mongoose = require("mongoose");

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
    // ✅ Store all login timestamps
    // ✅ Store login history with timestamps & IP addresses
    login_history: [
      {
        timestamp: {
          type: Date,
          default: () =>
            new Date(
              new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            ),
        },
        ip: { type: String, required: true },
        country: { type: String },
        deviceId: { type: String, required: true },
      },
    ],
    resetPasswordToken: { type: String },
  },
  { timestamps: true }
);

const AppUser = (module.exports = mongoose.model("AppUser", AppUserSchema));
