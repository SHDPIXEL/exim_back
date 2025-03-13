const express = require('express');
const router = express.Router();

// Bring in Testimonials Contoller
let testimonials = require('../controllers/testimonials');

// Testimonials List Route Start
router.get('/list', is_authenticated, testimonials.list);
// Testimonials List Route End

// Get Testimonials Route Start
router.post('/get_testimonials', testimonials.get_testimonials);
// Get Testimonials Route End

// Testimonial Add Route Start
router.get('/add', is_authenticated, testimonials.add);
// Testimonial Add Route End

// Testimonial Store Route Start
router.post('/store', testimonials.store);
// Testimonial Store Route End

// Testimonial Edit Route Start
router.get('/edit/:id', is_authenticated, testimonials.edit);
// Testimonial Edit Route End

// Testimonial Update Route Start
router.put('/update/:id', testimonials.update);
// Testimonial Update Route End

// Testimonial Delete Route Start
router.delete('/delete/:id', testimonials.delete);
// Testimonial Delete Route End

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
