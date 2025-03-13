const express = require('express');
const router = express.Router();

// Bring in Edition Model
let Edition = require('../models/appointmentEdition');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Editions List Start
	list: function(req, res) {
  		res.render('editions/list_edition');
	},
	// Editions List End

	// Get Editions Data Start
	get_editions: function(req, res) {
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
	    	var common_search = { $or: [{"edition": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    Edition.count({}, function(err, c) {
	        recordsTotal=c;
	        Edition.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Edition.find(searchStr, '_id edition status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Editions Data End

	// Edition Add Form Start
	add: function(req, res) {
  			res.render('editions/add_edition');
	},
	// Edition Add Form End

	// Edition Store Data Start
	store: function(req, res) {
	  	const edition = req.body.edition;
	  	const status = req.body.status;

	  	Edition.findOne({'edition': edition}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Edition Already Exist.');
	  		} else {
			    let new_edition = new Edition({
			      edition: edition,
			      status: status
			    });

		        new_edition.save(function(err) {
		          if(err) {
		            console.log(err);
		            res.send('error|'+err);
		          } else {
		          	let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Add',
				        table: 'editions'
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
	// Edition Store Data End

	// Edition Edit Form Start
	edit: function(req, res) {
		Edition.findById(req.params.id, function(err, edition) {
		    if(edition) {
		      	res.render('editions/edit_edition', {
		      	edition: edition
		    	});
		    }
		});
	},
	// Edition Edit Form End

	// Edition Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		Edition.findOne({ $and: [{'edition': req.body.edition}, {'_id': { $ne: req.params.id}}]}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Edition Already Exist.');
	  		} else {
		  		let edition = {};
		  		edition.edition = req.body.edition;
			  	edition.status = req.body.status;
		  		Edition.update(query, edition, function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Edit',
				        table: 'editions'
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
	// Edition Update Data End

	// Edition Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

  		Edition.findById(req.params.id, function(err, edition) {
    		if(edition) {
      		Edition.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'editions'
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
	// Edition Delete Data End

	// Fetch Editions Data Start
	fetch_editions: function(req, res) {
		Edition.find({}, function(err, editions) {
			if(editions) {
				res.send(editions);
			}
		})
	}
	// Fetch Editions Data End
}