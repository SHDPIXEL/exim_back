const express = require('express');
const router = express.Router();
const passport = require('passport');

// Bring in User Contoller
let users = require('../controllers/users');

// Bring in Log Model
let Log = require('../models/log');

// Users List Route Start
router.get('/list', is_authenticated, users.list);
// Users List Route End

// Get Users Route Start
router.post('/get_users', users.get_users);
// Get Users Route End

// User Add Route Start
router.get('/add', is_authenticated, users.add);
// User Add Route End

// User Store Route Start
router.post('/store', users.store);
// User Store Route End

// User Edit Route Start
router.get('/edit/:id', is_authenticated, users.edit);
// User Edit Route End

// User Update Route Start
router.put('/update/:id', users.update);
// User Update Route End

// User Delete Route Start
router.delete('/delete/:id', users.delete);
// User Delete Route End

// Login Form Route Start
router.get('/login', users.login);
// Login Form Route End

// Check Login Start
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {session: true}, function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('msg', info.message);
      return res.redirect('/users/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }

      let new_log = new Log({
        user_id: req.user._id,
        message: 'Login',
        table: 'users'
      });

      new_log.save(function(err, user) {
        if(err) {
          console.log('err '+err);
          return res.send(err);
        }
      });

      return res.redirect('/dashboard');
    });
  })(req, res, next);
});
// Check Login End

// logout Route Start
router.get('/logout', users.logout);
// logout Route End

// Fetch Users Route Start
router.get('/fetch_users', users.fetch_users);
// Fetch Users Route End

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
