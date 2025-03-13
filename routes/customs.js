const express = require('express');
const router = express.Router();

// Bring in Customs Contoller
let customs = require('../controllers/customs');

// Customs List Route Start
router.get('/list', is_authenticated, customs.list);
// Customs List Route End

// Get Customs Route Start
router.post('/get_customs', customs.get_customs);
// Get Customs Route End

// Customs Add Route Start
router.get('/add', is_authenticated, customs.add);
// Customs Add Route End

// Customs Store Route Start
router.post('/store', customs.store);
// Customs Store Route End

// Custom Edit Route Start
router.get('/edit/:id', is_authenticated, customs.edit);
// Custom Edit Route End

// Custom Update Route Start
router.put('/update/:id', customs.update);
// Custom Update Route End

// Custom Delete Route Start
router.delete('/delete/:id', customs.delete);
// Custom Delete Route End

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
