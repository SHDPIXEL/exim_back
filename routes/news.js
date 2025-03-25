const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/news');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      }
    });

var upload = multer({ storage: storage });

// Bring in News Contoller
let news = require('../controllers/news');

// News List Route Start
router.get('/list', is_authenticated, news.list);
// News List Route End

// Get News Route Start 
router.post('/get_news', news.get_news);
router.post('/get_news_recent', news.get_news_recent);
router.post('/get_news_pagination', news.get_news_pagination);
router.post('/get_news_topstories', news.get_news_topstories);
router.post('/get_news/:id', news.get_news_id);
router.post('/get_news_category', news.get_category_news);
router.post('/get_news_by_category', news.get_news_by_category_id);
router.post('/update-inFocus',news.new_update_inFocus)
router.post('/search',news.search_news)
router.post('/get_inFocus',news.getInFocusNews)
router.post('/get_search_news_categoryId',news.search_news_categoryId)

// Get News Route End

// News Add Route Start
router.get('/add', is_authenticated, news.add);
// News Add Route End

// News Store Route Start
router.post('/store', upload.single('image'), news.store);
// News Store Route End

// News Edit Route Start
router.get('/edit/:mongo_id/:id?', is_authenticated, news.edit);
// News Edit Route End

// News Update Route Start
router.post('/update/:mongo_id/:id?', upload.single('image'), news.update);
// News Update Route End

// News Delete Route Start
router.delete('/delete/:mongo_id/:id?', news.delete);
// News Delete Route End

// Get News from Sql Route Start
/*router.get('/get_sql_news', function(req, res) {
  
  // create Request object
  var request = new sql.Request();
     
  // query to the database and get the records
  request.query('select TOP 3 * from yaziltest ORDER BY NewsID DESC', function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// News from Sql Route End

// Store News in Sql Route Start
/*router.post('/sql_news', function(req, res) {

  // create Request object
  var request = new sql.Request();

  var input = JSON.parse(JSON.stringify(req.body));
     
  // query to the database and get the records
  request.query("INSERT INTO yaziltest (Headline, CategoryID, URLNo, mainnews, NewsDate, fourlines, Details)VALUES ('"+input.headline+"', '"+input.category_id+"', '0', '0', '"+input.news_date+"', '"+input.fourlines+"', '"+input.details+"')", function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// Store News in Sql Route End

// Update News in Sql Route Start
/*router.put('/sql_news/:id', function(req, res) {

  // create Request object
  var request = new sql.Request();

  var input = JSON.parse(JSON.stringify(req.body));
     
  // query to the database and get the records
  request.query("UPDATE yaziltest SET Headline = '"+input.headline+"', CategoryID = '"+input.category_id+"', NewsDate = '"+input.news_date+"', fourlines = '"+input.fourlines+"', Details = '"+input.details+"' WHERE NewsID = "+req.params.id+"", function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// Update News in Sql Route End

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
