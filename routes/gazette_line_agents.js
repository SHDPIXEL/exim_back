const express = require('express');
const router = express.Router();

// Bring in Gazette Line Agent Contoller
let gazette_line_agents = require('../controllers/gazette_line_agents');

// Gazette Line Agents List Route Start
router.get('/list', is_authenticated, gazette_line_agents.list);
// Gazette Line Agents List Route End

// Get Gazette Line Agents Route Start
router.post('/get_gazette_line_agents', gazette_line_agents.get_gazette_line_agents);
// Get Gazette Line Agents Route End

// Gazette Line Agent Add Route Start
router.get('/add', is_authenticated, gazette_line_agents.add);
// Gazette Line Agent Add Route End

// Gazette Line Agents Store Route Start
router.post('/store', gazette_line_agents.store);
// Gazette Line Agents Store Route End

// Gazette Line Agent Edit Route Start
router.get('/edit/:id', is_authenticated, gazette_line_agents.edit);
// Gazette Line Agent Edit Route End

// Gazette Line Agent Update Route Start
router.put('/update/:id', gazette_line_agents.update);
// Gazette Line Agent Update Route End

// Gazette Line Agent Delete Route Start
router.delete('/delete/:id', gazette_line_agents.delete);
// Gazette Line Agent Delete Route End

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
