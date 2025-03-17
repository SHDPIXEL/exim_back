const mongoose = require("mongoose");

const FileUploadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    files: [
      { 
        fileType: {
          type: String,
          enum: ["image", "video", "pdf", "word", "excel", "ppt", "zip", "other"],
          required: true,
        },
        filePath: {
          type: String, // Stores the file path instead of binary data
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileMimeType: {
          type: String, // Stores the MIME type (e.g., "image/png", "application/pdf")
          required: true,
        },
      },
    ],
    urls: [
      {
        type: String, // Supports multiple URLs if needed
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileUpload", FileUploadSchema);
