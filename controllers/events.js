const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in Event Categories Model
let EventCategory = require('../models/eventCategory');
// Bring in Events Model
let Event = require('../models/event');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Events List Start
	list: function(req, res) {
  		res.render('events/list_event');
	},
	// Events List End

	// Get Events Data Start
	get_events: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var category_search = req.body.columns[1].search.value;
	    var date_search = req.body.columns[5].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(category_search) {
	    	category_search = { $or: [{"category_id": category_search}]};
	    }
	    else {
	    	category_search = {};
	    }

	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"name": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "url": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "venue": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "status": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "date_two": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "date_three": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   category_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Event.count({}, function(err, c) {
	        recordsTotal=c;
	        Event.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Event.find(searchStr, '_id category_id name url venue date date_two date_three image status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order)
	                // .populate('category_id', 'category');
	        
	          });
	   });
	},
	// Get Events Data End

	get_events_website: function (req, res) {
		try {
			let colIndex = req.body.order?.[0]?.column;
			let col = req.body.columns?.[colIndex]?.data;
			let order = req.body.order?.[0]?.dir === 'asc' ? 1 : -1;
			let column_order = col ? { [col]: order } : { date: -1 }; // Default sorting by date descending
	
			let category_search = req.body.columns?.[1]?.search?.value || "";
			let date_search = req.body.columns?.[5]?.search?.value || "";
	
			category_search = category_search ? { $or: [{ "category_id": category_search }] } : {};
			date_search = date_search ? { $or: [{ "date": date_search }] } : {};
	
			let common_search = {};
			if (req.body.search?.value) {
				common_search = {
					$or: [
						{ "name": { "$regex": req.body.search.value, "$options": "i" } },
						{ "url": { "$regex": req.body.search.value, "$options": "i" } },
						{ "venue": { "$regex": req.body.search.value, "$options": "i" } },
						{ "status": { "$regex": req.body.search.value, "$options": "i" } },
						{ "date_two": { "$regex": req.body.search.value, "$options": "i" } },
						{ "date_three": { "$regex": req.body.search.value, "$options": "i" } }
					]
				};
			}
	
			let searchStr = { $and: [common_search, category_search, date_search] };
	
			Event.count({}, function (err, recordsTotal) {
				if (err) return res.status(500).json({ error: "Error counting total records" });
	
				Event.count(searchStr, function (err, recordsFiltered) {
					if (err) return res.status(500).json({ error: "Error counting filtered records" });
	
					Event.find(searchStr, '_id category_id name url venue date date_two date_three image status')
						.sort(column_order) // Always sort by date descending
						.limit(7) // Fetch only the 7 most recent events
						.exec(function (err, results) {
							if (err) {
								console.error('Error while getting results:', err);
								return res.status(500).json({ error: "Error retrieving events" });
							}
							
							res.json({
								draw: req.body.draw,
								recordsFiltered,
								recordsTotal,
								data: results
							});
						});
				});
			});
		} catch (error) {
			console.error('Unexpected error:', error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
	

	// Event Add Form Start
	add: function(req, res) {
		EventCategory.find({'status': '1'}, function(err, event_categories) {
  			res.render('events/add_event', {
  				event_categories: event_categories
  			});
  		});
	},
	// Event Add Form End

	// Event Store Data Start
	store: function(req, res) {
		const category_id = req.body.category_id;
	  	const name = req.body.name;
	  	const date = req.body.date;
	  	const date_two = req.body.date_two;
	  	const date_three = req.body.date_three;
	  	const venue = req.body.venue;
	  	const url = req.body.url;
	  	const status = req.body.status;
    	const image = (req.file !== undefined) ? 'http://eximindiaonline.in:3000/uploads/events/'+req.file.filename : '';

    	Event.findOne({$and: [{'name': name}, {'date': date}]}, function(err, event) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(event) {
	  			res.send('error|Event Already Exist on this Date.');
	  		} else {
			    let new_event = new Event({
			      category_id: category_id,
			      name: name,
			      date: date,
			      date_two: date_two,
			      date_three: date_three,
			      venue: venue,
			      url: url,
			      status: status,
			      image: image
			    });

		        new_event.save(function(err) {
		          if(err) {
		            console.log(err);
		            res.send('error|'+err);
		          } else {
		          	let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Add',
				        table: 'events'
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
	// Event Store Data End

	// Event Edit Form Start
	edit: function(req, res) {
		EventCategory.find({'status': '1'}, function(err, event_categories) {
			Event.findById(req.params.id, function(err, event) {
		    	if(event) {
		      		res.render('events/edit_event', {
		      			event_categories: event_categories,
		      			event: event
		    		});
		    	}
		    });
		});
	},
	// Event Edit Form End

	// Event Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		Event.findOne({$and: [{'name': req.body.name}, {'date': req.body.date}, {'_id': { $ne: req.params.id}}]}, function(err, event) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(event) {
	  			res.send('error|Event Already Exist on this Date.');
	  		} else {
        		Event.findById(req.params.id, function(err, event) {
		    		if(event) {
		    			event.category_id = req.body.category_id;
				  		event.name = req.body.name;
				        event.date = req.body.date;
				        event.date_two = req.body.date_two;
				        event.date_three = req.body.date_three;
				        event.venue = req.body.venue;
				        event.url = req.body.url;
				        event.status = req.body.status;
				        if(req.file !== undefined) {
			    			if(event.image !== '') {
			    				var image = event.image.split('/');
			    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5];
								// console.log(image);
				    			fs.unlink(image, function (err) {
								    if (err) { 
								    	console.log(err);
								    }
								    // if no error, file has been deleted successfully
								    console.log('File deleted!');return false;
								});
			    			}
		    				event.image = 'http://eximindiaonline.in:3000/uploads/events/'+req.file.filename;
				    	}

				        // console.log(events);return false;
				  		event.save(function(err) {
				    		if(err) {
				      			console.log(err);
				      			res.send('error|'+err);
				    		} else {
				    			let new_log = new Log({
							        user_id: req.user._id,
							        message: 'Edit',
							        table: 'events'
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
    		}
		});
	},
	// Event Update Data End

	// Event Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Event.findById(req.params.id, function(err, event) {
    		if(event) {
    			if(event.image != '') {
    				var image = event.image.split('/');
    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5];
					// console.log(image);return false;
	    			fs.unlink(image, function (err) {
					    if (err) { 
					    	// throw err;
					    	console.log(err);
					    	return res.send('error|'+err);
					    }
					    // if no error, file has been deleted successfully
					    console.log('File deleted!');
					});
    			}
      		Event.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'events'
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
	// Event Delete Data End
}