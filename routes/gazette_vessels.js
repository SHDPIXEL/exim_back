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

// Bring in Gazette Vessels Contoller
let gazette_vessels = require('../controllers/gazette_vessels');

// Gazette Vessels List Route Start
router.get('/list', is_authenticated, gazette_vessels.list);
// Gazette Vessels List Route End

// Get Gazette Vessels Route Start
router.post('/get_gazette_vessels', gazette_vessels.get_gazette_vessels);
// Get Gazette Vessels Route End

// Vessel Add Route Start
router.get('/add', is_authenticated, gazette_vessels.add);
// Vessel Add Route End

// Gazette Vessels View Route Start
router.post('/view_gazette_vessels', upload.single('file'), gazette_vessels.view_gazette_vessels);
// Gazette Vessels View Route End

// Gazette Vessels Store Route Start
router.post('/store', upload.single('file'), gazette_vessels.store);
// Gazette Vessels Store Route End

// Vessel Edit Route Start
// router.get('/edit/:id', is_authenticated, news.edit);
// Vessel Edit Route End

// Vessel Update Route Start
// router.post('/update/:id', upload.single('image'), news.update);
// Vessel Update Route End

// Vessel Delete Route Start
router.delete('/delete/:id', gazette_vessels.delete);
// Vessel Delete Route End

// Vessel Multiple Delete Route Start
router.delete('/mult_delete', gazette_vessels.mult_delete);
// Vessel Multiple Delete Route End

// Gazette Vessels Export Route Start
router.get('/export_gazette_vessels', function(req, res) {
  const file = `../exim_app/public/Gazette Vessels.csv`;
  res.download(file);
});
// Gazette Vessels Export Route End

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
