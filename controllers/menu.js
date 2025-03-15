const Menu = require('../models/menu')
const multer = require("multer");
const path = require("path");

// Multer Configuration - Uploads to specific folders based on field name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./uploads/menu/images"); // Image folder
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./uploads/menu/videos"); // Video folder
    } else {
      cb(null, "./uploads/menu/others"); // Other files folder
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// 📌 API to Upload Files & Save to DB
const uploadFile = async (req, res) => {
    try {
      const { title, urls, status } = req.body;
  
      if (!req.files && (!urls || urls.length === 0)) {
        return res.status(400).json({ message: "Please upload a file or provide URLs." });
      }
  
      // Processing Uploaded Files
      let uploadedFiles = [];
      if (req.files) {
        uploadedFiles = req.files.map((file) => ({
          fileType: file.mimetype.split("/")[1], // Extracts file type (e.g., pdf, png)
          fileData: file.path, // Stores file path (not binary data)
          fileName: file.filename,
          fileMimeType: file.mimetype,
        }));
      }
  
      // Creating & Saving Document in MongoDB
      const newFileUpload = new Menu({
        title,
        files: uploadedFiles,
        urls: urls ? urls.split(",") : [], // Supports multiple URLs
        status: status || "active",
      });
  
      await newFileUpload.save();
  
      res.status(201).json({ message: "File uploaded successfully", file: newFileUpload });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };