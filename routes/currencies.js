const express = require('express');
const router = express.Router();

// Bring in Currencies Contoller
let currencies= require('../controllers/currencies');

// Currencies List Route Start
router.get('/list', is_authenticated, currencies.list);
// Currencies List Route End

// Get Currencies Route Start
router.post('/get_currencies', currencies.get_currencies);
// Get Currencies Route End

// Currency Add Route Start
router.get('/add', is_authenticated, currencies.add);
// Currency Add Route End

// Currency Store Route Start
router.post('/store', currencies.store);
// Currency  Store Route End

// Currency Edit Route Start
router.get('/edit/:id', is_authenticated, currencies.edit);
// Currency Edit Route End

// Currency Update Route Start
router.put('/update/:id', currencies.update);
// Currency Update Route End

// Currency Delete Route Start
router.delete('/delete/:id', currencies.delete);
// Currency Delete Route End

// Fetch Currencies Route Start
router.get('/fetch_currencies', currencies.fetch_currencies);
// Fetch Currencies Route End

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
