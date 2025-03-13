const express = require('express');
const router = express.Router();

// Bring in Editions Contoller
let editions= require('../controllers/editions');

// Editions List Route Start
router.get('/list', is_authenticated, editions.list);
// Editions List Route End

// Get Editions Route Start
router.post('/get_editions', editions.get_editions);
// Get Editions Route End

// Edition Add Route Start
router.get('/add', is_authenticated, editions.add);
// Edition Add Route End

// Edition Store Route Start
router.post('/store', editions.store);
// Edition Store Route End

// Edition Edit Route Start
router.get('/edit/:id', is_authenticated, editions.edit);
// Edition Edit Route End

// Edition Update Route Start
router.put('/update/:id', editions.update);
// Edition Update Route End

// Edition Delete Route Start
router.delete('/delete/:id', editions.delete);
// Edition Delete Route End

// Fetch Editions Route Start
router.get('/fetch_editions', editions.fetch_editions);
// Fetch Editions Route End

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
