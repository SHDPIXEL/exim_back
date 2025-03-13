const express = require('express');
const router = express.Router();
const moment = require('moment');

// Bring in News Model
let News = require('../models/news');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Newsletters List Start
	/*list: function(req, res) {
  		// res.render('user/list_user');
	},*/
	// Newsletters List End

	// Get Newsletters Data Start
	/*get_users: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};
	    var searchStr = req.body.search.value;
	    if(req.body.search.value)
	    {       
	      searchStr = { $or: [{ "name": { "$regex": req.body.search.value, "$options": "i" } }, { "email": { "$regex": req.body.search.value, "$options": "i" } }, { "role": { "$regex": req.body.search.value, "$options": "i" } }, { "status": { "$regex": req.body.search.value, "$options": "i" } }] };
	    }
	    else
	    {
	      searchStr={};
	    }

	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    User.count({}, function(err, c) {
	        recordsTotal=c;
	        User.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                User.find(searchStr, '_id name role email status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	},*/
	// Get Newsletters Data End

	// Newsletter Add Form Start
	newsletter: function(req, res) {
  		res.render('newsletter');
	},
	// Newsletter Add Form End

	// Newsletter Preview Data Start
	newsletter_preview: function(req, res) {
	  	// console.log(new Date(req.query.date));return false;
	  	News.aggregate([
		    {
				$match : {date : new Date(req.query.date)}
		    },
		    { 
				$group : { _id : { "category_id": "$category_id", date: "$date"}}
		    },
		    {
		    	$sort : {"_id.category_id" : 1}
		    }
		    ],
		    function (err, category_id) {
	        	if (err) {
	            	console.log(err);
	            	return;
	        	}

	        	News.find({$and: [{'date': new Date(req.query.date)}, {'category_id': {$nin: ['7', '8']}}]}, function(err, news) {
			  		if(err) {
			  			console.log('error '+err);
			            res.send('error|'+err);
			  		}
			  		// console.log(news);return false;
		        	res.render('newsletter_preview', {
		          		category_id: category_id,
		          		news: news,
		          		date: req.query.date
		          	});
	  			}).select('category_id headline sql_id');
	    	}
		);
			/*let new_log = new Log({
	        	user_id: req.user._id,
	        	message: 'Newsletter Preview',
	        	table: 'news'
	      	});

	      	new_log.save(function(err, user) {
	        	if(err) {
	          		console.log('err '+err);
	          		return res.send(err);
	        	}
	      	});*/
	},
	// Newsletter Preview Data End

	// Newsletter Edit Form Start
	/*edit: function(req, res) {
		User.findById(req.params.id, function(err, user) {
		    if(user) {
		      	res.render('user/edit_user', {
		      	userr: user
		    	});
		    }
		});
	},*/
	// Newsletter Edit Form End

	// Newsletter Update Data Start
	/*update: function(req, res) {
  		let query = {_id: req.params.id}
  		User.findOne({ $and: [{'email': req.body.email}, {'_id': { $ne: req.params.id}}]}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Email Already Exist.');
	  		} else {
			    User.findOne({'_id': req.params.id}, function(err, userr) {
			  		userr.name = req.body.name;
			  		userr.role = req.body.role;
			  		userr.email = req.body.email;
			  		userr.password = req.body.password;
			  		userr.status = req.body.status;
    				userr.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			      			res.send('success|Record Updated Successfully.');
			    		}
		  			});
			    });
	  		}
	  	});
	},*/
	// Newsletter Update Data End

	// Newsletter Delete Data Start
	/*delete: function(req, res) {
  		let query = {_id: req.params.id}
  		// console.log(req.params.id);
  		User.findById(req.params.id, function(err, user) {
    		if(user) {
      		// console.log(query);
      		User.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
          			res.send('success|Record Deleted Successfully.');
        		}
      		});
    		}
  		});
	},*/
	// Newsletter Delete Data End

	// Newsletter Login Form Start
	/*login: function(req, res) {
  		req.flash('msg', '');
  		res.render('login');
	},*/
	// Newsletter Login Form End

	// Newsletter Logout Start
	/*logout: function(req, res) {
		let new_log = new Log({
	        user_id: req.user._id,
	        message: 'Logout',
	        table: 'users'
	     });

	    new_log.save(function(err, user) {
	        if(err) {
	          console.log('err '+err);
	          return res.send(err);
	        }
	    });
  		req.logout();
  		res.redirect('/');
	},*/
	// Newsletter Logout End

	// Fetch Newsletters Data Start
	/*fetch_users: function(req, res) {
  		User.find({}, function(err, users) {
  			if(err) {
  				console.log('err '+err);
  				return res.send(err);
  			}
  			res.send(users);
  		});
	},*/
	// Fetch Newsletters Data End
}