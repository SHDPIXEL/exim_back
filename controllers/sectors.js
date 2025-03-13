const express = require('express');
const router = express.Router();

// Bring in Sector Model
let Sector = require('../models/sector');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Sectors List Start
	list: function(req, res) {
  		res.render('sectors/list_sector');
	},
	// Sectors List End

	// Get Sectors Data Start
	get_sectors: function(req, res) {
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
	    
	    Sector.count({}, function(err, c) {
	        recordsTotal=c;
	        Sector.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Sector.find(searchStr, '_id name ref_id status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Sectors Data End

	// Sector Add Form Start
	add: function(req, res) {
		Sector.findOne({}, function(err, sector) {
			if(sector) {
  				res.render('sectors/add_sector', {
  					sector: sector
  				});
			}
		}).sort('-ref_id')
	},
	// Sector Add Form End

	// Sector Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const ref_id = req.body.ref_id;
	  	const status = req.body.status;

	    let new_sector = new Sector({
	      name: name,
	      ref_id: ref_id,
	      status: status
	    });

        new_sector.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          	let new_log = new Log({
		        user_id: req.user._id,
		        message: 'Add',
		        table: 'sectors'
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
	// Sector Store Data End

	// Sector Edit Form Start
	edit: function(req, res) {
		Sector.findById(req.params.id, function(err, sector) {
		    if(sector) {
		      	res.render('sectors/edit_sector', {
		      	sector: sector
		    	});
		    }
		});
	},
	// Sector Edit Form End

	// Sector Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		let sector = {};
  		sector.name = req.body.name;
	  	sector.ref_id = req.body.ref_id;
	  	sector.status = req.body.status;
  		Sector.update(query, sector, function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
    			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Edit',
			        table: 'sectors'
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
	// Sector Update Data End

	// Sector Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Sector.findById(req.params.id, function(err, sector) {
    		if(sector) {
      		Sector.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'sectors'
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
	// Sector Delete Data End

	// Fetch Sectors Data Start
	fetch_sectors: function(req, res) {
		Sector.find({}, function(err, sectors) {
			if(sectors) {
				res.send(sectors);
			}
		})
	}
	// Fetch Sectors Data End
}