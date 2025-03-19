const express = require('express');
const multer = require("multer");
const path = require("path");
const router = express.Router();
const videoNews = require('../controllers/videoNews');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./assets/videoNews"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage: storage, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mkv|mov/;
    const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
    return isValid ? cb(null, true) : cb(new Error("Only video files are allowed!"));
  }
});
// Render the Add Poll Page
router.get('/add', (req, res) => {
    console.log("req user",req.user);
    res.render('videoNews/add_videoNews', { user: req.user || null });
});
 
router.get('/list', (req, res) => {
    console.log("req user",req.user);
    res.render('videoNews/list_videoNews', { user: req.user || null });
});


// API Routes
router.post("/store", upload.single("video"), videoNews.createVideoNews);
router.post("/get_videoNews", videoNews.getAllVideoNews); 
router.post('/news', videoNews.getPaginatedNews);
router.get("/get_videoNews/:id", videoNews.getVideoNewsById);
router.put("/update/:id", upload.single("video"), videoNews.updateVideoNews);
router.put("/toggle-infocus/:id", videoNews.toggleInFocus);
router.delete("/delete_videoNews/:id", videoNews.deleteVideoNews);


module.exports = router;