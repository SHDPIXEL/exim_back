const express = require('express');
const   router = express.Router();

// Bring in Forexes Contoller
let forexes = require('../controllers/forexes');

// Forexes List Route Start
router.get('/list', is_authenticated, forexes.list);
// Forexes List Route End

// Get Forexes Route Start
router.post('/get_forexes', forexes.get_forexes);
router.post('/get_forexes_website', forexes.get_forexes_website);
// Get Forexes Route End

// Forex  Add Route Start
router.get('/add', is_authenticated, forexes.add);
// Forex  Add Route End

// Forex  Store Route Start
router.post('/store', forexes.store);
// Forex  Store Route End

// Forex  Edit Route Start
router.get('/edit/:id', is_authenticated, forexes.edit);
// Forex  Edit Route End

// Forex  Update Route Start
router.put('/update/:id', forexes.update);
// Forex  Update Route End

// Forex  Delete Route Start
router.delete('/delete/:id', forexes.delete);
// Forex  Delete Route End

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
