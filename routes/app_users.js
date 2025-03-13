const express = require('express');
const router = express.Router();

// Bring in App User Contoller
let app_users = require('../controllers/app_users');

// Users List Route Start
router.get('/list', is_authenticated, app_users.list);
// Users List Route End

// Get App Users Route Start
router.post('/get_app_users', app_users.get_app_users);
// Get App Users Route End

// App User Delete Route Start
router.delete('/delete/:id', app_users.delete);
// App User Delete Route End

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
