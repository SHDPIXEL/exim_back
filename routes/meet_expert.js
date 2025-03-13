const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        	cb(null, './public/uploads/meet_expert');   		
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Meet Expert Contoller
let meet_expert = require('../controllers/meet_expert');

// Meet Expert Add Edit Route Start
router.get('/add_edit', is_authenticated, meet_expert.add_edit);
// Meet Expert Add Edit Route End

// Meet Expert Store Update Route Start
router.post('/store_update', upload.single('image'), meet_expert.store_update);
// Meet Expert Store Update Route End

// Meet Expert Edition Image Delete Route Start
// router.delete('/delete_edition_image/:id', about.delete_edition_image);
// Meet Expert Edition Image Delete Route End

// Access Control Start
function is_authenticated(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.role != 'vessel_user') {
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
