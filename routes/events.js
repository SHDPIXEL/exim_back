const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/events');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Events Contoller
let events = require('../controllers/events');

// Events List Route Start
router.get('/list', is_authenticated, events.list);
// Events List Route End

// Get Events Route Start
router.post('/get_events', events.get_events);
router.post('/get_events_website', events.get_events_website);
// Get Events Route End

// Event Add Route Start
router.get('/add', is_authenticated, events.add);
// Event Add Route End

// Event Store Route Start
router.post('/store', upload.single('image'), events.store);
// Event Store Route End

// Event Edit Route Start
router.get('/edit/:id', is_authenticated, events.edit);
// Event Edit Route End

// Event Update Route Start
router.post('/update/:id', upload.single('image'), events.update);
// Event Update Route End

// Event Delete Route Start
router.delete('/delete/:id', events.delete);
// Event Delete Route End

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
