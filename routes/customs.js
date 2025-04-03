const express = require('express');
const router = express.Router();

// Bring in Customs Contoller
let customs = require('../controllers/customs');
let Custom = require("../models/customs");


// Customs List Route Start
router.get('/list', is_authenticated, customs.list);
// Customs List Route End

// Get Customs Route Start
router.post('/get_customs', customs.get_customs);
router.post('/get_customs_website', customs.get_customs_website);
// Get Customs Route End

// Customs Add Route Start
router.get('/add', is_authenticated, customs.add);
// Customs Add Route End
router.get('/get/add', async (req, res) => {
  try {
      const id = req.query.id;
      let customData = null;

      if (id) {
          customData = await Custom.findOne({ sql_id: id });
      }

      res.render("customs/add", { customData });
  } catch (error) {
      console.error("Error fetching customs data:", error);
      res.status(500).send("Server error.");
  }
});
// Customs Store Route Start
router.post('/store', customs.store);
// Customs Store Route End

// Custom Edit Route Start
router.get('/edit/:id', is_authenticated, customs.edit);

router.get('/customs/:id', customs.getCustomById); // Get a single custom entry
router.put('/update_customs/:id', customs.updateCustomById); // Update a custom entry
// Custom Edit Route End

// Custom Update Route Start
router.put('/update/:id', customs.update);
// Custom Update Route End

// Custom Delete Route Start
router.delete('/delete/:id', customs.delete);
// Custom Delete Route End

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
