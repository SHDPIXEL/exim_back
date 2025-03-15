const express = require('express');
const router = express.Router();

let polls = require('../controllers/polls')


// Render the Add Poll Page
router.get('/add', (req, res) => {
    console.log("req user",req.user);
    res.render('polls/add_poll', { user: req.user || null });
});

router.get('/list', (req, res) => {
    console.log("req user",req.user);
    res.render('polls/list_polls', { user: req.user || null });
});

router.post('/store',polls.addPolls)
router.post('/get_Poll',polls.getPolls)
router.post('/submit_polls',polls.submitPoll)


module.exports = router;