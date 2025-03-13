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

// Bring in Break Bulk Vessels Contoller
let break_bulk_vessels = require('../controllers/break_bulk_vessels');

// Break Bulk Vessels List Route Start
router.get('/list', is_authenticated, break_bulk_vessels.list);
// Break Bulk Vessels List Route End

// Get Break Bulk Vessels Route Start
router.post('/get_break_bulk_vessels', break_bulk_vessels.get_break_bulk_vessels);
// Get Break Bulk Vessels Route End

// Break Bulk Vessel Add Route Start
router.get('/add', is_authenticated, break_bulk_vessels.add);
// Break Bulk Vessel Add Route End

// Break Bulk Vessels View Route Start
router.post('/view_break_bulk_vessels', upload.single('file'), break_bulk_vessels.view_break_bulk_vessels);
// Break Bulk Vessels View Route End

// Break Bulk Vessels Store Route Start
router.post('/store', upload.single('file'), break_bulk_vessels.store);
// Break Bulk Vessels Store Route End

// Break Bulk Vessel Edit Route Start
// router.get('/edit/:id', is_authenticated, news.edit);
// Break Bulk Vessel Edit Route End

// Break Bulk Vessel Update Route Start
// router.post('/update/:id', upload.single('image'), news.update);
// Break Bulk Vessel Update Route End

// Break Bulk Vessel Delete Route Start
router.delete('/delete/:id', break_bulk_vessels.delete);
// Break Bulk Vessel Delete Route End

// Break Bulk Vessel Multiple Delete Route Start
router.delete('/mult_delete', break_bulk_vessels.mult_delete);
// Break Bulk Vessel Multiple Delete Route End

// Break Bulk Vessels Export Route Start
router.get('/export_break_bulk_vessels', function(req, res) {
  const file = `../exim_app/public/Break Bulk Vessels.csv`;
  res.download(file);
});
// Break Bulk Vessels Export Route End

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
