const express = require('express');
const router = express.Router();

// Bring in App User Model
let AppUser = require('../models/appUser');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// App Users List Start
	list: function(req, res) {
  		res.render('app_users/list_app_user');
	},
	// App Users List End

	// Get App Users Data Start
	get_app_users: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var subscribe_newsletter_search = req.body.columns[6].search.value;
	    var date_search = req.body.columns[7].search.value;

	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(subscribe_newsletter_search) {
	    	subscribe_newsletter_search = { $or: [{"subscribe_newsletter": subscribe_newsletter_search}]};
	    }
	    else {
	    	subscribe_newsletter_search = {};
	    }

	    if(date_search) {
	    	date_search = { $or: [{ '$where': 'this.updatedAt.toJSON().slice(0, 10) == "'+date_search+'"' }]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"name": { "$regex": req.body.search.value, "$options": "i" }},
	    								{"company_name": { "$regex": req.body.search.value, "$options": "i" }},
	    								{"email": { "$regex": req.body.search.value, "$options": "i" }},
	    								{"mobile": { "$regex": req.body.search.value, "$options": "i" }},
	    								{"nature_business": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }

	    	var searchStr = { $and: [
	      						   common_search,
	      						   subscribe_newsletter_search,
	      						   date_search
	      						] };

	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    AppUser.count({}, function(err, c) {
	        recordsTotal=c;
	        AppUser.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                AppUser.find(searchStr, '_id name company_name email mobile nature_business subscribe_newsletter updatedAt', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get App Users Data End

	// App User Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		// console.log(req.params.id);
  		AppUser.findById(req.params.id, function(err, user) {
    		if(user) {
      		// console.log(query);
      		AppUser.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'app_users'
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
	},
	// App User Delete Data End
}