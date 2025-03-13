const express = require('express');
const router = express.Router();

// Bring in Question Answer Contoller
let question_answers = require('../controllers/question_answers');

// Question Answers List Route Start
router.get('/list', is_authenticated, question_answers.list);
// Question Answers List Route End

// Get Question Answers Route Start
router.post('/get_question_answers', question_answers.get_question_answers);
// Get Question Answers Route End

// Question Answer Add Route Start
router.get('/add', is_authenticated, question_answers.add);
// Question Answer Add Route End

// Question Answer Store Route Start
router.post('/store', question_answers.store);
// Question Answer Store Route End

// Question Answer Edit Route Start
router.get('/edit/:id', is_authenticated, question_answers.edit);
// Question Answer Edit Route End

// Question Answer Update Route Start
router.put('/update/:id', question_answers.update);
// Question Answer Update Route End

// Question Answer Delete Route Start
router.delete('/delete/:id', question_answers.delete);
// Question Answer Delete Route End

// Get Question Answer from Sql Route Start
/*router.get('/get_sql_question_answers', function(req, res) {
  
  // create Request object
  var request = new sql.Request();
     
  // query to the database and get the records
  request.query('select TOP 3 * from yaziltest ORDER BY question_answersID DESC', function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// Question Answer from Sql Route End

// Store Question Answer in Sql Route Start
/*router.post('/sql_question_answers', function(req, res) {

  // create Request object
  var request = new sql.Request();

  var input = JSON.parse(JSON.stringify(req.body));
     
  // query to the database and get the records
  request.query("INSERT INTO yaziltest (Headline, CategoryID, URLNo, mainquestion_answers, question_answersDate, fourlines, Details)VALUES ('"+input.headline+"', '"+input.category_id+"', '0', '0', '"+input.question_answers_date+"', '"+input.fourlines+"', '"+input.details+"')", function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// Store Question Answer in Sql Route End

// Update Question Answer in Sql Route Start
/*router.put('/sql_question_answers/:id', function(req, res) {

  // create Request object
  var request = new sql.Request();

  var input = JSON.parse(JSON.stringify(req.body));
     
  // query to the database and get the records
  request.query("UPDATE yaziltest SET Headline = '"+input.headline+"', CategoryID = '"+input.category_id+"', question_answersDate = '"+input.question_answers_date+"', fourlines = '"+input.fourlines+"', Details = '"+input.details+"' WHERE question_answersID = "+req.params.id+"", function (err, recordset) {
      
      if (err) console.log(err)

      // send records as a response
      res.send(recordset);
      
  });
});*/
// Update Question Answer in Sql Route End

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
