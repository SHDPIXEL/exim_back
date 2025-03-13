const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/year_books');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Year Books Contoller
let year_books = require('../controllers/year_books');

// Year Books List Route Start
router.get('/list', is_authenticated, year_books.list);
// Year Books List Route End

// Get Year Books Route Start
router.post('/get_year_books', year_books.get_year_books);
// Get Year Books Route End

// Year Book Add Route Start
router.get('/add', is_authenticated, year_books.add);
// Year Book Add Route End

// Year Book Store Route Start
router.post('/store', upload.single('image'), year_books.store);
// Year Book Store Route End

// Year Book Edit Route Start
router.get('/edit/:id', is_authenticated, year_books.edit);
// Year Book Edit Route End

// Year Book Update Route Start
router.post('/update/:id', upload.single('image'), year_books.update);
// Year Book Update Route End

// Year Book Delete Route Start
router.delete('/delete/:id', year_books.delete);
// Year Book Delete Route End

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
