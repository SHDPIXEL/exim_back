const express = require('express');
const router = express.Router();

// Bring in Line Agents Contoller
let line_agents = require('../controllers/line_agents');

// Line Agents List Route Start
router.get('/list', is_authenticated, line_agents.list);
// Line Agents List Route End

// Get Line Agents Route Start
router.post('/get_line_agents', line_agents.get_line_agents);
// Get Line Agents Route End

// Line Agents Add Route Start
router.get('/add', is_authenticated, line_agents.add);
// Line Agents Add Route End

// Line Agents Store Route Start
router.post('/store', line_agents.store);
// Line Agents Store Route End

// Line Agent Edit Route Start
router.get('/edit/:id', is_authenticated, line_agents.edit);
// Line Agent Edit Route End

// Line Agent Update Route Start
router.put('/update/:id', line_agents.update);
// Line Agent Update Route End

// Line Agent Delete Route Start
router.delete('/delete/:id', line_agents.delete);
// Line Agent Delete Route End

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
