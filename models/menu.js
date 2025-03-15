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
          enum: ["image", "video", "pdf", "word", "excel","ppt", "other"],
          required: true,
        },
        fileData: {
          type: Buffer, // Stores the actual file as binary data
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
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileUpload", FileUploadSchema);
