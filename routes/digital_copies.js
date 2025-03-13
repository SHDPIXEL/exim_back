const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/digital_copies');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Digital Copies Contoller
let digital_copies = require('../controllers/digital_copies');

// Digital Copies List Route Start
router.get('/list', is_authenticated, digital_copies.list);
// Digital Copies List Route End

// Get Digital Copies Route Start
router.post('/get_digital_copies', digital_copies.get_digital_copies);
// Get Digital Copies Route End

// Digital Copy Add Route Start
router.get('/add', is_authenticated, digital_copies.add);
// Digital Copy Add Route End

// Digital Copy Store Route Start
router.post('/store', upload.single('image'), digital_copies.store);
// Digital Copy Store Route End

// Digital Copy Edit Route Start
router.get('/edit/:id', is_authenticated, digital_copies.edit);
// Digital Copy Edit Route End

// Digital Copy Update Route Start
router.post('/update/:id', upload.single('image'), digital_copies.update);
// Digital Copy Update Route End

// Digital Copy Delete Route Start
router.delete('/delete/:id', digital_copies.delete);
// Digital Copy Delete Route End

// Access Control Start
function is_authenticated(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.role == 'admin') {
        return next();
    } else {
        req.flash('msg', 'You Dont have Permission.');
        return res.redirect('/dashboard');
    }
  } else {
    req.flash('msg', 'Please Login First');
    return res.redirect('/users/login');
  }
}
// Access Control End

module.exports = router;
