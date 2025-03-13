const express = require('express');
const router = express.Router();
const moment = require('moment');

// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Logs List Start
	list: function(req, res) {
  		res.render('logs');
	},
	// Logs List End

	// Get Logs Data Start
	get_logs: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var user_search = req.body.columns[1].search.value;
	    var table_search = req.body.columns[2].search.value;
	    var message_search = req.body.columns[3].search.value;
	    var date_search = req.body.columns[4].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(user_search) {
	    	user_search = { $or: [{"user_id": user_search}]};
	    }
	    else {
	    	user_search = {};
	    }

	    if(table_search) {
	    	table_search = { $or: [{"table": { "$regex": table_search, "$options": "i" }}]};
	    }
	    else {
	    	table_search = {};
	    }

	    if(message_search) {
	    	message_search = { $or: [{"message": { "$regex": message_search, "$options": "i" }}]};
	    }
	    else {
	    	message_search = {};
	    }

	    if(date_search) {
	    	date_search = { $or: [{ '$where': 'this.createdAt.toJSON().slice(0, 10) == "'+date_search+'"' }]};
	    }
	    else {
	    	date_search = {};
	    }
	    /*if(req.body.search.value)
	    {
	    	var common_search = { $or: [{ "message": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "table": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }*/
	      	var searchStr = { $and: [
		      						   user_search,
		      						   table_search,
		      						   message_search,
		      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Log.count({}, function(err, c) {
	        recordsTotal=c;
	        Log.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Log.find(searchStr, '_id user_id.name message table createdAt', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order).populate('user_id', 'name');
	        
	          });
	   });
	},
	// Get Logs Data End

	// Log Add Form Start
	/*add: function(req, res) {
  		res.render('logs/add_log');
	},*/
	// Log Add Form End

	// Log Store Data Start
	/*store: function(req, res) {
	  	const office = req.body.office;
	  	const type = req.body.type;
	  	const address = req.body.address;
	  	const telephone = req.body.telephone;
	  	const fax = req.body.fax;
	  	const email = req.body.email;

	    let new_log = new Log({
	      office: office,
	      type: type,
	      address: address,
	      telephone: telephone,
	      fax: fax
	    });

		if(email != '') {
		    email.map(function(val, ind) {
		    	if(val != '') {
		    		let emaill = {};
		    		emaill.email = val;
		    		new_log.emails.unshift(emaill);
		    	}
		    });
		}

        new_log.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
            res.send('success|Record Inserted Successfully.');
          }
        });
	},*/
	// Log Store Data End

	// Log Edit Form Start
	/*edit: function(req, res) {
		Log.findById(req.params.id, function(err, log) {
		    if(log) {
		      	res.render('logs/edit_log', {
		      	log: log
		    	});
		    }
		});
	},*/
	// Log Edit Form End

	// Log Update Data Start
	/*update: function(req, res) {
  		let query = {_id: req.params.id}

		Log.findById(req.params.id, function(err, log) {
    		if(log) {
		  		log.office = req.body.office;
		        log.type = req.body.type;
		        log.address = req.body.address;
		        log.telephone = req.body.telephone;
		        log.fax = req.body.fax;
		        const email = req.body.email;

		        if(email != '') {
			        email.map(function(val, ind) {
				    	if(val != '') {
				    		let emaill = {};
				    		emaill.email = val;
				    		log.emails.unshift(emaill);
				    	}
				    });
		    	}

		  		log.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		      			res.send('success|Record Updated Successfully.');
		    		}
		  		});
        	}
		});
	},*/
	// Log Update Data End

	// Log Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Log.findById(req.params.id, function(err, log) {
    		if(log) {
      		Log.remove(query, function(err) {
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
	// Log Delete Data End

	// Log Email Delete Data Start
	/*email_delete: function(req, res) {
  		Log.findById(req.params.log_id, function(err, log) {
  			// console.log(log);return false;
    		if(log) {
      			log.emails.pull({'_id': req.params.email_id});
      			log.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		      			res.send('success|Email Deleted Successfully.');
		    		}
			  	});
    		}
  		});
	}*/
	// Log Email Delete Data End
}