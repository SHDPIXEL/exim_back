const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

let Adds = require("../controllers/adds");

// Setup Multer storage with conditional directories
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./assets/adds/images"); // Store images in './assets/adds/images'
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./assets/adds/videos"); // Store videos in './assets/adds/videos'
    } else {
      cb(new Error("Only images and videos are allowed.")); // Reject if not an image or video
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`; // Ensure uniqueness
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Keep original extension
  },
});

// Create Multer instance for image and video uploads with size limit of 3MB
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // Limit file size to 3MB (3 * 1024 * 1024 bytes)
    files: 10, // Allow up to 10 files in one request
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov/; // Accepts image formats like png and webp
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    ); // Validate file extension  
    const mimetype = fileTypes.test(file.mimetype); // Validate MIME type

    // console.log("File MIME type: ", file.mimetype); // For debugging
    // console.log(
    //   "File Extension: ",
    //   path.extname(file.originalname).toLowerCase()
    // ); // For debugging

    if (extname && mimetype) {
      return cb(null, true); // Allow the file
    } else {
      return cb(new Error("Only images and videos are allowed.")); // Reject if invalid
    }
  },
}); 

// Render the Add Poll Page
router.get("/add", (req, res) => {
  console.log("req user", req.user);
  res.render("adds/add_adds", { user: req.user || null });
});

router.get("/list", (req, res) => {
  console.log("req user", req.user);
  res.render("adds/list_adds", { user: req.user || null });
});

router.get("/link", (req, res) => {
  console.log("req user", req.user);
  res.render("adds/link_adds", { user: req.user || null });
});

router.get("/linklist", (req, res) => {
  console.log("req user", req.user);
  res.render("adds/link_list", { user: req.user || null });
});

router.post(
  "/store",
  upload.fields([
    { name: "images" }, // Adjust maxCount as per your requirements
    { name: "videos" }, // Adjust maxCount as per your requirements
  ]),
  Adds.createAdd
);
router.post("/get_adds",Adds.getAllAdds)
router.post("/get_adds_Admin",Adds.getAllAddsAdmin)
router.post("/update-media-status", Adds.updateMediaStatus);
router.delete("/delete/:addId", Adds.deleteAdd);
router.get('/manage-ads', async (req, res) => {
  try {
      const adds = await getAdsFromDB();
      res.render('adds/link_adds', { adds });
  } catch (error) {
      res.status(500).send("Error fetching ads");
  }
});
router.get("/media", Adds.getMediaFromAdds);
router.post("/media/store", Adds.saveSelectedMedia); // Save selected Ad
router.post("/get_selected",Adds.getSelectedMedia)
router.post("/get_selected_Admin",Adds.getSelectedMediaAdmin)
router.delete("/delete-selected-media/:id", Adds.deleteSelectedMedia);
router.post("/updateSelectedMediaStatus", Adds.updateSelectedMediaStatus);

module.exports = router;
