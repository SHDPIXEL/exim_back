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

    console.log("Expiring Subscriptions Updated:", expiringSubscriptions.length);
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

module.exports = { checkExpiringSubscriptions, getExpiringSubscriptions };