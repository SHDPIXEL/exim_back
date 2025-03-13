const express = require('express');
const router = express.Router();

// Bring in Sectors Contoller
let sectors = require('../controllers/sectors');

// Sectors List Route Start
router.get('/list', is_authenticated, sectors.list);
// Sectors List Route End

// Get Sectors Route Start
router.post('/get_sectors', sectors.get_sectors);
// Get Sectors Route End

// Sector Add Route Start
router.get('/add', is_authenticated, sectors.add);
// Sector Add Route End

// Sector Store Route Start
router.post('/store', sectors.store);
// Sector Store Route End

// Sector Edit Route Start
router.get('/edit/:id', is_authenticated, sectors.edit);
// Sector Edit Route End

// Sector Update Route Start
router.put('/update/:id', sectors.update);
// Sector Update Route End

// Sector Delete Route Start
router.delete('/delete/:id', sectors.delete);
// Sector Delete Route End

// Fetch Sectors Route Start
router.get('/fetch_sectors', sectors.fetch_sectors);
// Fetch Sectors Route End

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
