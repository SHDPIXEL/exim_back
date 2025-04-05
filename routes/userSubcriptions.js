const express = require("express");
const { getExpiringSubscriptions,getAllUserSubscriptions } = require("../controllers/userSubcription");

const router = express.Router();

router.get('/list', (req, res) => {
    console.log("req user",req.user);
    res.render('upcomingRenewals/list_upcomingrenewals', { user: req.user || null });
});

router.get('/list', (req, res) => {
    console.log("req user",req.user);
    res.render('userSubscriptions/list_usersubscriptions', { user: req.user || null });
});

router.get("/expiring-subscriptions", getExpiringSubscriptions);
router.get("/subscriptions", getAllUserSubscriptions);

module.exports = router;