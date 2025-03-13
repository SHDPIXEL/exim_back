const express = require('express');
const router = express.Router();

// Bring in Logs Contoller
let logs = require('../controllers/logs');

// Logs List Route Start
router.get('/list', is_authenticated, logs.list);
// Logs List Route End

// Get Logs Route Start
router.post('/get_logs', logs.get_logs);
// Get Logs Route End

// Log Add Route Start
// router.get('/add', is_authenticated, logs.add);
// Log Add Route End

// Log Store Route Start
// router.post('/store', logs.store);
// Log Store Route End

// Log Edit Route Start
// router.get('/edit/:id', is_authenticated, logs.edit);
// Log Edit Route End

// Log Update Route Start
// router.put('/update/:id', logs.update);
// Log Update Route End

// Log Delete Route Start
router.delete('/delete/:id', logs.delete);
// Log Delete Route End

// Log Email Delete Route Start
// router.delete('/email_delete/:contact_id/:email_id', logs.email_delete);
// Log Email Delete Route End

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
