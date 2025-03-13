const express = require('express');
const router = express.Router();

// Bring in Job Titles Contoller
let job_titles= require('../controllers/job_titles');

// Job Titles List Route Start
router.get('/list', is_authenticated, job_titles.list);
// Job Titles List Route End

// Get Job Titles Route Start
router.post('/get_job_titles', job_titles.get_job_titles);
// Get Job Titles Route End

// Job Title Add Route Start
router.get('/add', is_authenticated, job_titles.add);
// Job Title Add Route End

// Job Title Store Route Start
router.post('/store', job_titles.store);
// Job Title  Store Route End

// Job Title Edit Route Start
router.get('/edit/:id', is_authenticated, job_titles.edit);
// Job Title Edit Route End

// Job Title Update Route Start
router.put('/update/:id', job_titles.update);
// Job Title Update Route End

// Job Title Delete Route Start
router.delete('/delete/:id', job_titles.delete);
// Job Title Delete Route End

// Fetch Job Titles Route Start
router.get('/fetch_job_titles', job_titles.fetch_job_titles);
// Fetch Job Titles Route End

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
