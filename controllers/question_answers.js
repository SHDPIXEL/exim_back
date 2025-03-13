const express = require('express');
const router = express.Router();
var moment = require("moment");

// Bring in Meet expert Model
let MeetExpert = require('../models/meetExpert');
// Bring in Question Answers Model
let QuestionAnswer = require('../models/questionAnswer');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Question Answers List Start
	list: function(req, res) {
  		res.render('question_answers/list_question_answer');
	},
	// Question Answers List End

	// Get Question Answers Data Start
	get_question_answers: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var date_search = req.body.columns[1].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"question": { "$regex": req.body.search.value, "$options": "i" }},
		      						   	{ "answer": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    QuestionAnswer.count({}, function(err, c) {
	        recordsTotal=c;
	        QuestionAnswer.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                QuestionAnswer.find(searchStr, '_id date question answer', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
	                    if (err) {
	                        console.log('error while getting results'+err);
	                        return;
	                    }
	            
	                    var data = JSON.stringify({
	                        "draw": req.body.draw,
	                        "recordsFiltered": recordsFiltered,
	                        "recordsTotal": recordsTotal,
	                        "data": results
	                    });
	                    res.send(data);
	                }).sort(column_order);
	        
	          });
	   });
	},
	// Get Question Answers Data End

	// Question Answer Add Form Start
	add: function(req, res) {
	    MeetExpert.findOne({}, function(err, meet_expert) {
  			res.render('question_answers/add_question_answer', {
  				meet_expert: meet_expert
  			});
  		}).select('_id');
	},
	// Question Answer Add Form End

	// Question Answer Store Data Start
	store: function(req, res) {
	  	const meet_expert_id = req.body.meet_expert_id;
	  	const date = req.body.date;
	  	const question = req.body.question;
	  	const answer = req.body.answer;

		let new_question_answers = new QuestionAnswer({
	      	meet_expert_id: meet_expert_id,
	      	date: date,
	      	question: question,
	      	answer: answer
	    });

        new_question_answers.save(function(err) {
	        if(err) {
	            console.log(err);
	            res.send('error|'+err);
	        } else {
          		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'question_answers'
		      	});

		        new_log.save(function(err, user) {
		        	if(err) {
		          		console.log('err '+err);
		          		return res.send(err);
		        	}
		      	});
            res.send('success|Record Inserted Successfully.');
          }
        });
	},
	// Question Answer Store Data End

	// Question Answer Edit Form Start
	edit: function(req, res) {
	    QuestionAnswer.findOne({'_id': req.params.id}, function(err, question_answer) {
	        if(question_answer) {
	      	    res.render('question_answers/edit_question_answer', {
	      	    question_answer: question_answer
	    	    });
	        }
	    });
	},
	// Question Answer Edit Form End

	// Question Answer Update Data Start
	update: function(req, res) {

        QuestionAnswer.findOne({'_id': req.params.id}, function(err, question_answer) {
	    	if(question_answer) {
		        question_answer.date = req.body.date;
		        question_answer.question = req.body.question;
		        question_answer.answer = req.body.answer;

		        // console.log(question_answers);return false;
		  		question_answer.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Edit',
					        table: 'question_answers'
				      	});

				        new_log.save(function(err, user) {
				        	if(err) {
				          		console.log('err '+err);
				          		return res.send(err);
				        	}
				      	});
		      			res.send('success|Record Updated Successfully.');
		    		}
		  		});
	        }
	    });
	},
	// Question Answer Update Data End

	// Question Answer Delete Data Start
	delete: function(req, res) {
  		 
		QuestionAnswer.findOne({'_id': req.params.id}, function(err, question_answer) {
    		if(question_answer) {
      			QuestionAnswer.remove({'_id': req.params.id}, function(err) {
	        		if(err) {
	          			console.log(err);
	          			res.send('error|'+err);
	        		} else {
	        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'question_answers'
			      	});

			        new_log.save(function(err, user) {
			        	if(err) {
			          		console.log('err '+err);
			          		return res.send(err);
			        	}
			      	});
	          			res.send('success|Record Deleted Successfully.');
	        		}
      			});
    		}
  		});
	}
	// Question Answer Delete Data End
}