const express = require('express');
const router = express.Router();

// Bring in Contacts Contoller
let contacts = require('../controllers/contacts');

// Contacts List Route Start
router.get('/list', is_authenticated, contacts.list);
// Contacts List Route End

// Get Contacts Route Start
router.post('/get_contacts', contacts.get_contacts);
// Get Contacts Route End

// Contact Add Route Start
router.get('/add', is_authenticated, contacts.add);
// Contact Add Route End

// Contact Store Route Start
router.post('/store', contacts.store);
// Contact Store Route End

// Contact Edit Route Start
router.get('/edit/:id', is_authenticated, contacts.edit);
// Contact Edit Route End

// Contact Update Route Start
router.put('/update/:id', contacts.update);
// Contact Update Route End

// Contact Delete Route Start
router.delete('/delete/:id', contacts.delete);
// Contact Delete Route End

// Contact Email Delete Route Start
router.delete('/email_delete/:contact_id/:email_id', contacts.email_delete);
// Contact Email Delete Route End

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
