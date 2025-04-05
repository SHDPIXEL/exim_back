const cron = require("node-cron");
const UserSubscriptions = require("../models/userSubscription");
const moment = require("moment");

let expiringSubscriptions = [];

const checkExpiringSubscriptions = async () => {
  try {
    const oneMonthLater = moment().add(1, "month").toDate();

    expiringSubscriptions = await UserSubscriptions.find({
      expiryDate: { $lte: oneMonthLater },
    }).populate("userId", "name email mobile");

    console.log(
      "Expiring Subscriptions Updated:",
      expiringSubscriptions.length
    );
  } catch (error) {
    console.error("Error fetching expiring subscriptions:", error);
  }
};

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", checkExpiringSubscriptions);

// Expose API to get expiring subscriptions
const getExpiringSubscriptions = (req, res) => {
  return res.status(200).json({
    success: 1,
    data: expiringSubscriptions,
  });
};

const getAllUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await UserSubscriptions.find()
      .select("userId location expiryDate duration price type createdAt")
      .populate("userId", "name email mobile") // Ensure this matches your AppUser model
      .sort({ createdAt: -1 });

    // Debug log: shows first record to verify populated structure
    if (subscriptions.length > 0) {
      console.log("Sample populated subscription:", subscriptions[0]);
    } else {
      console.log("No subscriptions found");
    }

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  checkExpiringSubscriptions,
  getExpiringSubscriptions,
  getAllUserSubscriptions,
};
