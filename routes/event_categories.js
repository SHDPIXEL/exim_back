const express = require('express');
const router = express.Router();

// Bring in Event Categories Contoller
let event_categories = require('../controllers/event_categories');

// Event Categories List Route Start
router.get('/list', is_authenticated, event_categories.list);
// Event Categories List Route End

// Get Event Categories Route Start
router.post('/get_event_categories', event_categories.get_event_categories);
router.post('/get_event_categories_website', event_categories.get_event_categories_website);
// Get Event Categories Route End

// Event Category Add Route Start
router.get('/add', is_authenticated, event_categories.add);
// Event Category Add Route End

// Event Category Store Route Start
router.post('/store', event_categories.store);
// Event Category Store Route End

// Event Category Edit Route Start
router.get('/edit/:id', is_authenticated, event_categories.edit);
// Event Category Edit Route End

// Event Category Update Route Start
router.put('/update/:id', event_categories.update);
// Event Category Update Route End

// Event Category Delete Route Start
router.delete('/delete/:id', event_categories.delete);
// Event Category Delete Route End

// Fetch Event Categories Route Start
router.get('/fetch_event_categories', event_categories.fetch_event_categories);
// Fetch Event Categories Route End

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
