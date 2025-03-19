const mongoose = require("mongoose");

const NewsSchema = mongoose.Schema({
  position: {
    type: String, // You can adjust the type based on your use case, like 'top', 'bottom', etc.
    required: true
  },
  images: [{
    filePath: {
      type: String, // File path for the image
      required: true
    },
    status: {
      type: String, // 'active', 'inactive', etc.
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  }],
  videos: [{
    filePath: {
      type: String, // Video file path
      required: true
    },
    status: {
      type: String, // 'active', 'inactive', etc.
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  }],
  status: {
    type: String, // 'active', 'inactive', etc.
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
});
 
const Adds = mongoose.model("Adds", NewsSchema);

module.exports = Adds;
