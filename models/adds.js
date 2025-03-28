const mongoose = require("mongoose");

const NewsSchema = mongoose.Schema({
  position: {
    type: String, // e.g., 'top', 'bottom', etc.
    required: true
  },
  media: {
    filePath: {
      type: String, // File path for image or video
      required: true
    },
    url: {
      type: String, // Destination URL when clicked
      required: true
    },
    mediaType: {
      type: String, // Either 'image' or 'video'
      enum: ['image', 'video'],
      required: true
    },
    status: {
      type: String, // 'Active' or 'Inactive'
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  status: {
    type: String, // Overall ad status
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
});

const Adds = mongoose.model("Adds", NewsSchema);

module.exports = Adds;
