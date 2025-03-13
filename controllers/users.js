const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// User List Start
	list: function(req, res) {
  		res.render('user/list_user');
	},
	// User List End

	// Get User Data Start
	get_users: function(req, res) {
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
	},
	// Get User Data End

	// User Add Form Start
	add: function(req, res) {
  		res.render('user/add_user');
	},
	// User Add Form End

	// User Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const email = req.body.email;
	  	const role = req.body.role;
	  	const password = req.body.password;
	  	const status = req.body.status;

	  	User.findOne({'email': email}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Email Already Exist.');
	  		} else {
			    let new_user = new User({
			      name: name,
			      email: email,
			      role: role,
			      password: password,
			      status: status
			    });
		        new_user.save(function(err) {
		          if(err) {
		            console.log('save '+err);
		            res.send('error|'+err);
		          } else {
		            res.send('success|Record Inserted Successfully.');
		          }
		        });
	  		}
	  	});
	},
	// User Store Data End

	// User Edit Form Start
	edit: function(req, res) {
		User.findById(req.params.id, function(err, user) {
		    if(user) {
		      	res.render('user/edit_user', {
		      	userr: user
		    	});
		    }
		});
	},
	// User Edit Form End

	// User Update Data Start
	update: function(req, res) {
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
	},
	// User Update Data End

	// User Delete Data Start
	delete: function(req, res) {
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
	},
	// User Delete Data End

	// User Login Form Start
	login: function(req, res) {
  		req.flash('msg', '');
  		res.render('login');
	},
	// User Login Form End

	// User Logout Start
	logout: function(req, res) {
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
	},
	// User Logout End

	// Fetch Users Data Start
	fetch_users: function(req, res) {
  		User.find({}, function(err, users) {
  			if(err) {
  				console.log('err '+err);
  				return res.send(err);
  			}
  			res.send(users);
  		});
	},
	// Fetch Users Data End
}