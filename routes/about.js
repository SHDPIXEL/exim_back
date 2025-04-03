const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
      	if(file.fieldname === 'image') {
        	cb(null, './public/uploads/about/networks');   		
      	} else {
      		cb(null, './public/uploads/about/editions');
      	}
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in About Contoller
let about = require('../controllers/about');

// About Add Edit Route Start
router.get('/add_edit', is_authenticated, about.add_edit);
router.get('/get_about', about.getAbout);
// About Add Edit Route End

// About Store Update Route Start
router.post('/store_update', upload.fields([{
					           name: 'image'
					         }, {
					           name: 'edition_images[]'
					         }]), about.store_update);
// About Store Update Route End

// About Edition Image Delete Route Start
router.delete('/delete_edition_image/:id', about.delete_edition_image);
// About Edition Image Delete Route End

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
