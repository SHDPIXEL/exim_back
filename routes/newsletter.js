const express = require('express');
const router = express.Router();
const passport = require('passport');

// Bring in Newsletter Contoller
let newsletter = require('../controllers/newsletter');

// Bring in Log Model
let Log = require('../models/log');

// Newsletters List Route Start
// router.get('/list', is_authenticated, users.list);
// Newsletters List Route End

// Get Newsletters Route Start
// router.post('/get_users', users.get_users);
// Get Newsletters Route End

// Newsletter Add Route Start
router.get('/', is_authenticated, newsletter.newsletter);
// Newsletter Add Route End

// Newsletter Store Route Start
// router.get('/newsletter_preview', newsletter.newsletter_preview);

router.get("/newsletter_preview", async (req, res) => {
  try {
      const { date } = req.query;
      if (!date) {
          return res.status(400).json({ error: "Date parameter is required" });
      }

      const htmlContent = await newsletter.fetchNewsByCategory(date);
      res.setHeader("Content-Type", "text/html");
      res.send(htmlContent);
  } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});
// Newsletter Store Route End

// Newsletter Edit Route Start
// router.get('/edit/:id', is_authenticated, users.edit);
// Newsletter Edit Route End

// Newsletter Update Route Start
// router.put('/update/:id', users.update);
// Newsletter Update Route End

// Newsletter Delete Route Start
// router.delete('/delete/:id', users.delete);
// Newsletter Delete Route End

// Login Form Route Start
// router.get('/login', users.login);
// Login Form Route End

// Check Login Start
/*router.post('/login', function(req, res, next) {
  passport.authenticate('local', {session: true}, function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('msg', info.message);
      return res.redirect('/users/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }

      let new_log = new Log({
        user_id: req.user._id,
        message: 'Login',
        table: 'users'
      });

      new_log.save(function(err, user) {
        if(err) {
          console.log('err '+err);
          return res.send(err);
        }
      });

      return res.redirect('/dashboard');
    });
  })(req, res, next);
});*/
// Check Login End

// logout Route Start
// router.get('/logout', users.logout);
// logout Route End

// Fetch Newsletters Route Start
// router.get('/fetch_users', users.fetch_users);
// Fetch Newsletters Route End

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
