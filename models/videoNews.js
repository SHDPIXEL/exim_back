const mongoose = require("mongoose");

// News Schema
const NewsSchema = mongoose.Schema(
  {
    category_id: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    headline: {
      type: String,
      required: true,
    },
    breaking_news: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    four_lines: {
      type: String,
    },
    videos: {
      type: String,
    },
    urls: {
      type: String,
    },
    inFocus: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isVideo: {
      type: Boolean,
      default: false, // Default to false if not provided
    },
  },
  { timestamps: true }
);

const videoNews = mongoose.model("videoNews", NewsSchema);
module.exports = videoNews;
