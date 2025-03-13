const express = require('express');
const router = express.Router();

// Bring in Terminal Model
let Port = require('../models/port');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Terminals List Start
	list: function(req, res) {
  		res.render('terminals/list_terminal');
	},
	// Terminals List End

	// Get Terminals Data Start
	get_terminals: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var status_search = req.body.columns[3].search.value;
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
	      						   { "ref_id": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    Port.count({}, function(err, c) {
	        recordsTotal=c;
	        Port.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Port.find(searchStr, '_id name ref_id status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Terminals Data End

	// Terminal Add Form Start
	add: function(req, res) {
		Port.findOne({}, function(err, port) {
			if(port) {
  				res.render('terminals/add_terminal', {
  					port: port
  				});
			}
		}).sort('-ref_id')
	},
	// Terminal Add Form End

	// Terminal Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const ref_id = req.body.ref_id;
	  	const status = req.body.status;

	    let new_port = new Port({
	      name: name,
	      ref_id: ref_id,
	      status: status
	    });

        new_port.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          	let new_log = new Log({
		        user_id: req.user._id,
		        message: 'Add',
		        table: 'terminals'
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
	// Terminal Store Data End

	// Terminal Edit Form Start
	edit: function(req, res) {
		Port.findById(req.params.id, function(err, port) {
		    if(port) {
		      	res.render('terminals/edit_terminal', {
		      	port: port
		    	});
		    }
		});
	},
	// Terminal Edit Form End

	// Terminal Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		let port = {};
  		port.name = req.body.name;
	  	port.ref_id = req.body.ref_id;
	  	port.status = req.body.status;
  		Port.update(query, port, function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
    			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Edit',
			        table: 'terminals'
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
	// Terminal Update Data End

	// Terminal Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Port.findById(req.params.id, function(err, port) {
    		if(port) {
      		Port.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'terminals'
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
	// Terminal Delete Data End

	// Fetch Sectors Data Start
	fetch_terminals: function(req, res) {
		Port.find({}, function(err, ports) {
			if(ports) {
				res.send(ports);
			}
		})
	}
	// Fetch Sectors Data End
}