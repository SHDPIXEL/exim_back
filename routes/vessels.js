const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/vessels');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in Vessels Contoller
let vessels = require('../controllers/vessels');

// Vessels List Route Start
router.get('/list', is_authenticated, vessels.list);
// Vessels List Route End

// Get Vessels Route Start
router.post('/get_vessels', vessels.get_vessels);
// Get Vessels Route End

// Vessel Add Route Start
router.get('/add', is_authenticated, vessels.add);
// Vessel Add Route End

// Vessels View Route Start
router.post('/view_vessels', upload.single('file'), vessels.view_vessels);
// Vessels View Route End

// Vessels Store Route Start
router.post('/store', upload.single('file'), vessels.store);
// Vessels Store Route End

// Vessel Edit Route Start
// router.get('/edit/:id', is_authenticated, news.edit);
// Vessel Edit Route End

// Vessel Update Route Start
// router.post('/update/:id', upload.single('image'), news.update);
// Vessel Update Route End

// Vessel Delete Route Start
router.delete('/delete/:id', vessels.delete);
// Vessel Delete Route End

// Vessel Multiple Delete Route Start
router.delete('/mult_delete', vessels.mult_delete);
// Vessel Multiple Delete Route End

// Vessels Export Route Start
router.get('/export_vessels', function(req, res) {
  const file = `../exim_app/public/Vessels.csv`;
  res.download(file);
});
// Vessels Export Route End

// Access Control Start
function is_authenticated(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.role != 'news_appointment_user') {
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
