const express = require('express');
const router = express.Router();

// Bring in Terminals Contoller
let terminals = require('../controllers/terminals');

// Terminals List Route Start
router.get('/list', is_authenticated, terminals.list);
// Terminals List Route End

// Get Terminals Route Start
router.post('/get_terminals', terminals.get_terminals);
// Get Terminals Route End

// Terminal Add Route Start
router.get('/add', is_authenticated, terminals.add);
// Terminal Add Route End

// Terminal Store Route Start
router.post('/store', terminals.store);
// Terminal Store Route End

// Terminal Edit Route Start
router.get('/edit/:id', is_authenticated, terminals.edit);
// Terminal Edit Route End

// Terminal Update Route Start
router.put('/update/:id', terminals.update);
// Terminal Update Route End

// Terminal Delete Route Start
router.delete('/delete/:id', terminals.delete);
// Terminal Delete Route End

// Fetch Terminals Route Start
router.get('/fetch_terminals', terminals.fetch_terminals);
// Fetch Terminals Route End

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
