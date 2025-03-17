const express = require("express");
const router = express.Router();
const fileUploadController = require("../controllers/menu");

router.get('/add', (req, res) => {
    console.log("req user",req.user);
    res.render('files/add_file', { user: req.user || null });
});

router.get('/list', (req, res) => {
    console.log("req user",req.user); 
    res.render('files/list_files', { user: req.user || null });   
});

router.post("/store", fileUploadController.uploadFiles);
router.post("/get_files", fileUploadController.getAllFiles);
router.get("/files/:id", fileUploadController.getFileById);
router.delete("/files/:id", fileUploadController.deleteFileById);
router.post("/download", fileUploadController.downloadFile);
 
module.exports = router;