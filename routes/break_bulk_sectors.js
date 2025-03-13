const express = require('express');
const router = express.Router();

// Bring in Break Bulk break_bulk_sectors Contoller
let break_bulk_sectors = require('../controllers/break_bulk_sectors');

// Break Bulk break_bulk_sectors List Route Start
router.get('/list', is_authenticated, break_bulk_sectors.list);
// Break Bulk break_bulk_sectors List Route End

// Get Break Bulk break_bulk_sectors Route Start
router.post('/get_break_bulk_sectors', break_bulk_sectors.get_break_bulk_sectors);
// Get Break Bulk break_bulk_sectors Route End

// Break Bulk Sector Add Route Start
router.get('/add', is_authenticated, break_bulk_sectors.add);
// Break Bulk Sector Add Route End

// Break Bulk Sector Store Route Start
router.post('/store', break_bulk_sectors.store);
// Break Bulk Sector Store Route End

// Break Bulk Sector Edit Route Start
router.get('/edit/:id', is_authenticated, break_bulk_sectors.edit);
// Break Bulk Sector Edit Route End

// Break Bulk Sector Update Route Start
router.put('/update/:id', break_bulk_sectors.update);
// Break Bulk Sector Update Route End

// Break Bulk Sector Delete Route Start
router.delete('/delete/:id', break_bulk_sectors.delete);
// Break Bulk Sector Delete Route End

// Fetch Break Bulk break_bulk_sectors Route Start
router.get('/fetch_break_bulk_sectors', break_bulk_sectors.fetch_break_bulk_sectors);
// Fetch Break Bulk break_bulk_sectors Route End

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
