const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        if(file.fieldname === 'image') {
          cb(null, './public/uploads/advertisements/images');
        } else {
          cb(null, './public/uploads/advertisements/videos');
        }
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Advertisements Contoller
let advertisements = require('../controllers/advertisements');

// Advertisements List Route Start
router.get('/list', is_authenticated, advertisements.list);
// Advertisements List Route End

// Get Advertisements Route Start
router.post('/get_advertisements', advertisements.get_advertisements);
// Get Advertisements Route End

// Advertisement Add Route Start
router.get('/add', is_authenticated, advertisements.add);
// Advertisement Add Route End

// Advertisement Store Route Start
router.post('/store', upload.fields([{
                     name: 'image'
                   }, {
                     name: 'video'
                   }]), advertisements.store);
// Advertisement Store Route End

// Advertisement Edit Route Start
router.get('/edit/:id', is_authenticated, advertisements.edit);
// Advertisement Edit Route End

// Advertisement Update Route Start
router.post('/update/:id', upload.fields([{
                     name: 'image'
                   }, {
                     name: 'video'
                   }]), advertisements.update);
// Advertisement Update Route End

// Advertisement Delete Route Start
router.delete('/delete/:id', advertisements.delete);
// Advertisement Delete Route End

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
