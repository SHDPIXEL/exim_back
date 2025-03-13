const express = require('express');
const router = express.Router();

// Bring in Job Title Model
let JobTitle = require('../models/appointmentJobTitle');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Job Titles List Start
	list: function(req, res) {
  		res.render('job_titles/list_job_title');
	},
	// Job Titles List End

	// Get Job Titles Data Start
	get_job_titles: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var status_search = req.body.columns[2].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(status_search) {
	    	status_search = { $or: [{"status": status_search}]};
	    }
	    else {
	    	status_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"job_title": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   status_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    JobTitle.count({}, function(err, c) {
	        recordsTotal=c;
	        JobTitle.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                JobTitle.find(searchStr, '_id job_title status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Job Titles Data End

	// Job Title Add Form Start
	add: function(req, res) {
  			res.render('job_titles/add_job_title');
	},
	// Job Title Add Form End

	// Job Title Store Data Start
	store: function(req, res) {
	  	const job_title = req.body.job_title;
	  	const status = req.body.status;

	  	JobTitle.findOne({'job_title': job_title}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Job Title Already Exist.');
	  		} else {
			    let new_job_title = new JobTitle({
			      job_title: job_title,
			      status: status
			    });

		        new_job_title.save(function(err) {
		          if(err) {
		            console.log(err);
		            res.send('error|'+err);
		          } else {
		          	let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Add',
				        table: 'job_titles'
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
    		}
		});
	},
	// Job Title Store Data End

	// Job Title Edit Form Start
	edit: function(req, res) {
		JobTitle.findById(req.params.id, function(err, job_title) {
		    if(job_title) {
		      	res.render('job_titles/edit_job_title', {
		      	job_title: job_title
		    	});
		    }
		});
	},
	// Job Title Edit Form End

	// Job Title Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		JobTitle.findOne({ $and: [{'job_title': req.body.job_title}, {'_id': { $ne: req.params.id}}]}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Job Title Already Exist.');
	  		} else {
		  		let job_title = {};
		  		job_title.job_title = req.body.job_title;
			  	job_title.status = req.body.status;
		  		JobTitle.update(query, job_title, function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Edit',
					        table: 'job_titles'
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
	// Job Title Update Data End

	// Job Title Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

  		JobTitle.findById(req.params.id, function(err, job_title) {
    		if(job_title) {
      		JobTitle.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'job_titles'
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
	// Job Title Delete Data End

	// Fetch Job Titles Data Start
	fetch_job_titles: function(req, res) {
		JobTitle.find({}, function(err, job_titles) {
			if(job_titles) {
				res.send(job_titles);
			}
		})
	}
	// Fetch Job Titles Data End
}