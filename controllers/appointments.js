const express = require('express');
const router = express.Router();

// Bring in Appointment Model
let Appointment = require('../models/appointment');
// Bring in Job Title Model
let JobTitle = require('../models/appointmentJobTitle');
// Bring in Edition Model
let Edition = require('../models/appointmentEdition');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Appointments List Start
	list: function(req, res) {
  		res.render('appointments/list_appointment');
	},
	// Appointments List End

	// Get Appointments Data Start
	get_appointments: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var job_title_search = req.body.columns[1].search.value;
	    var edition_search = req.body.columns[2].search.value;
	    var date_search = req.body.columns[3].search.value;
	    var status_search = req.body.columns[4].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(job_title_search) {
	    	job_title_search = { $or: [{"job_title_id": job_title_search}]};
	    }
	    else {
	    	job_title_search = {};
	    }

	    if(edition_search) {
	    	edition_search = { $or: [{"edition_id": edition_search}]};
	    }
	    else {
	    	edition_search = {};
	    }

	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(status_search) {
	    	status_search = { $or: [{"status": status_search}]};
	    }
	    else {
	    	status_search = {};
	    }

	    /*if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"job_title_id.job_title": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "edition_id.edition": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }*/
	      	var searchStr = { $and: [
	      						   job_title_search,
	      						   edition_search,
	      						   date_search,
	      						   status_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Appointment.count({}, function(err, c) {
	        recordsTotal=c;
	        Appointment.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Appointment.find(searchStr, '_id job_title_id.job_title edition_id.edition date status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order).populate('job_title_id', 'job_title').populate('edition_id', 'edition');
	        
	          });
	   });
	},
	// Get Appointments Data End

	// Appointment Add Form Start
	add: function(req, res) {
		JobTitle.find({'status': '1'}, function(err, job_titles) {
			Edition.find({'status': '1'}, function(err, editions) {
				if(job_titles && editions) {
	  				res.render('appointments/add_appointment', {
	  					job_titles: job_titles,
	  					editions: editions
	  				});
				}
			});
		});
	},
	// Appointment Add Form End

	// Appointment Store Data Start
	store: function(req, res) {
	  	const job_title_id = req.body.job_title_id;
	  	const edition_id = req.body.edition_id;
	  	const date = req.body.date;
	  	const description = req.body.description;
	  	const status = req.body.status;

	  	if(job_title_id != '') {
	  		job_title_id.map(function(val, ind) {
			    let new_appointment = new Appointment({
			      job_title_id: val,
			      edition_id: edition_id,
			      date: date,
			      description: description,
			      status: status
			    });
		        new_appointment.save(function(err) {
		          if(err) {
		            console.log(err);
		            // res.send('error|'+err);
		          }
		        });
	  		});
	  			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'appointments'
	      		});

	        	new_log.save(function(err, user) {
	        		if(err) {
	          			console.log('err '+err);
	          			return res.send(err);
	        		}
	      		});
		        res.send('success|Record Inserted Successfully.');
	  	}
	},
	// Appointment Store Data End

	// Appointment Edit Form Start
	edit: function(req, res) {
		Appointment.findById(req.params.id, function(err, appointment) {
			JobTitle.find({'status': '1'}, function(err, job_titles) {
				Edition.find({'status': '1'}, function(err, editions) {
		    		if(appointment && job_titles && editions) {
		      			res.render('appointments/edit_appointment', {
		      				appointment: appointment,
		      				job_titles: job_titles,
		      				editions: editions
		    			});
		    		}
				});
			});
		});
	},
	// Appointment Edit Form End

	// Appointment Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		let appointment = {};
  		// appointment.job_title_id = req.body.job_title_id;
	  	appointment.edition_id = req.body.edition_id;
	  	appointment.date = req.body.date;
	  	appointment.description = req.body.description;
	  	appointment.status = req.body.status;
  		Appointment.update(query, appointment, function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
    			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Edit',
			        table: 'appointments'
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
	},
	// Appointment Update Data End

	// Appointment Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Appointment.findById(req.params.id, function(err, appointment) {
			if(appointment) {
				Appointment.remove(query, function(err) {
					if(err) {
  						console.log(err);
  						res.send('error|'+err);
					} else {
						let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete',
					        table: 'appointments'
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
	// Appointment Delete Data End

	// Fetch Appointments Data Start
	/*fetch_appointments: function(req, res) {
		appointment.find({}, function(err, appointments) {
			if(appointments) {
				res.send(appointments);
			}
		})
	}*/
	// Fetch Appointments Data End
}