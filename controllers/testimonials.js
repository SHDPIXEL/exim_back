const express = require('express');
const router = express.Router();

// Bring in Testimonials Model
let Testimonial = require('../models/testimonial');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Testimonials List Start
	list: function(req, res) {
  		res.render('testimonials/list_testimonial');
	},
	// Testimonials List End

	// Get Testimonials Data Start
	get_testimonials: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var status_search = req.body.columns[4].search.value;
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
	    	var common_search = { $or: [{"name": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "company_designation": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "description": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    Testimonial.count({}, function(err, c) {
	        recordsTotal=c;
	        Testimonial.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Testimonial.find(searchStr, '_id name company_designation description status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Testimonials Data End

	// testimonial Add Form Start
	add: function(req, res) {
  		res.render('testimonials/add_testimonial');
	},
	// testimonial Add Form End

	// testimonial Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const company_designation = req.body.company_designation;
	  	const description = req.body.description;
	  	const status = req.body.status;

	    let new_testimonial = new Testimonial({
	      name: name,
	      company_designation: company_designation,
	      description: description,
	      status: status
	    });

        new_testimonial.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'testimonials'
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
	// testimonial Store Data End

	// testimonial Edit Form Start
	edit: function(req, res) {
		Testimonial.findById(req.params.id, function(err, testimonial) {
		    if(testimonial) {
		      	res.render('testimonials/edit_testimonial', {
		      	testimonial: testimonial
		    	});
		    }
		});
	},
	// testimonial Edit Form End

	// testimonial Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

		Testimonial.findById(req.params.id, function(err, testimonial) {
    		if(testimonial) {
		  		testimonial.name = req.body.name;
		        testimonial.company_designation = req.body.company_designation;
		        testimonial.description = req.body.description;
		        testimonial.status = req.body.status;
		  		testimonial.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Edit',
					        table: 'testimonials'
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
	// testimonial Update Data End

	// testimonial Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Testimonial.findById(req.params.id, function(err, testimonial) {
    		if(testimonial) {
      		Testimonial.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'testimonials'
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
	// testimonial Delete Data End
}