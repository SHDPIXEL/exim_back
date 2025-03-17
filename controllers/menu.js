const Menu = require("../models/menu");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Configuration - Uploads to specific folders based on field name
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, "./uploads/menu/images"); // Image folder
//     } else if (file.mimetype.startsWith("video/")) {
//       cb(null, "./uploads/menu/videos"); // Video folder
//     } else {
//       cb(null, "./uploads/menu/others"); // Other files folder
//     }
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// const upload = multer({ storage: storage });
// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "./assets/menu/others"; // Default  folder

    // Categorize based on MIME type
    if (file.mimetype.startsWith("image/")) {
      uploadPath = "./assets/menu/images";
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = "./assets/menu/videos";
    }

    // Ensure the folder exists before saving
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("files", 10); // Allows multiple file uploads (max 10)

// Helper function to determine file type based on MIME type
const getFileType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("msword") || mimeType.includes("wordprocessingml"))
    return "word";
  if (mimeType.includes("spreadsheetml") || mimeType.includes("excel"))
    return "excel";
  if (mimeType.includes("presentationml") || mimeType.includes("powerpoint"))
    return "ppt";
  if (mimeType === "application/zip") return "zip";
  return "other";
};

// exports.verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

//   if (!token) {
//     return res.status(403).json({ error: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token with SECRET_KEY
//     req.user = decoded; // Attach decoded user data to request
//     next(); // Proceed to the next middleware/controller
//   } catch (error) {
//     return res.status(401).json({ error: "Invalid token." });
//   }
// };

// 📌 API to Upload Files & Save to DB
exports.uploadFiles = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (
      (!req.files || req.files.length === 0) &&
      (!req.body.urls || req.body.urls.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "Please upload a file or provide URLs." });
    }

    try {
      const { title, urls, status } = req.body;

      // Process uploaded files
      const filesArray = req.files.map((file) => ({
        fileType: getFileType(file.mimetype),
        filePath: file.path, // Stores file path instead of binary data
        fileName: file.filename,
        fileMimeType: file.mimetype,
      }));

      // Create and save the document
      const newUpload = new Menu({
        title,
        files: filesArray,
        urls: urls ? urls.split(",") : [], // Convert comma-separated URLs to an array
        status: status || "Active",
      });

      await newUpload.save();
      res
        .status(201)
        .json({ message: "Files uploaded successfully", data: newUpload });
    } catch (error) {
      console.error("Upload error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while uploading files." });
    }
  });
};
 
// Get all uploaded files
exports.getAllFiles = async (req, res) => {
  try {
    const files = await Menu.find().lean();

    const updatedFiles = files.map((file) => ({
      ...file,
      files: file.files.map((f) => {
        // If file type is image or video, use its respective folder
        const folder = f.fileType === "image" || f.fileType === "video" 
          ? f.fileType + "s" // "images" or "videos" 
          : "others"; // Everything else goes into "others"

        const filePath = `/assets/menu/${folder}/${f.fileName}`; // Dynamically construct file path
        console.log("Generated filePath:", filePath); // Debugging log
        return { ...f, filePath };
      }),
    }));

    console.log("Final API Response:", updatedFiles); // Debugging log
    res.status(200).json(updatedFiles);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete file by ID
exports.deleteFileById = async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Remove files from the server
    file.files.forEach((fileItem) => {
      if (fs.existsSync(fileItem.filePath)) {
        fs.unlinkSync(fileItem.filePath);
      }
    });

    await FileUpload.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download file by ID and filename
exports.downloadFile = async (req, res) => {
  try {
    console.log("req",req.body)
    const { filePath } = req.body; // Get the file path from the request body

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    // Resolve the absolute path based on your server's directory structure
    const absoluteFilePath = path.resolve(__dirname, "../assets", filePath);
    console.log("test",absoluteFilePath)

    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Get the file name from the path
    const fileName = path.basename(filePath);
    console.log("name",fileName)
    // Set response headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(absoluteFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("File Download Error:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
};
