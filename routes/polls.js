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
router.get('/get/:id', polls.getPollById);
router.put('/update/:id', polls.updatePoll);
router.post('/submit_polls',polls.submitPoll)
router.delete('/delete/:id', polls.deletePoll);


module.exports = router;