const express = require('express');
const router = express.Router();

// Bring in Break Bulk Sector Model
let BreakBulkSector = require('../models/breakBulkSector');
// Bring in Sector Model
let Sector = require('../models/sector');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Break Bulk Sectors List Start
	list: function(req, res) {
  		res.render('break_bulk_sectors/list_break_bulk_sector');
	},
	// Break Bulk Sectors List End

	// Get Break Bulk Sectors Data Start
	get_break_bulk_sectors: function(req, res) {
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
	    
	    BreakBulkSector.count({}, function(err, c) {
	        recordsTotal=c;
	        BreakBulkSector.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                BreakBulkSector.find(searchStr, '_id name ref_id status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Break Bulk Sectors Data End

	// Break Bulk Sector Add Form Start
	add: function(req, res) {
		BreakBulkSector.findOne({}, function(err, break_bulk_sector) {
			Sector.findOne({'ref_id': '8'}, function(err, sector) {
				if(sector || break_bulk_sector) {
  					res.render('break_bulk_sectors/add_break_bulk_sector', {
  						sector: sector,
  						break_bulk_sector: break_bulk_sector
  					});
				}
			});
		}).sort('-ref_id');
	},
	// Break Bulk Sector Add Form End

	// Break Bulk Sector Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const ref_id = req.body.ref_id;
	  	const sector_id = req.body.sector_id;
	  	const status = req.body.status;

	    let new_break_bulk_sector = new BreakBulkSector({
	      name: name,
	      ref_id: ref_id,
	      sector_id: sector_id,
	      status: status
	    });

        new_break_bulk_sector.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          	let new_log = new Log({
		        user_id: req.user._id,
		        message: 'Add',
		        table: 'Break Bulk Sectors'
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
	// Break Bulk Sector Store Data End

	// Break Bulk Sector Edit Form Start
	edit: function(req, res) {
		BreakBulkSector.findById(req.params.id, function(err, break_bulk_sector) {
		    if(break_bulk_sector) {
		      	res.render('break_bulk_sectors/edit_break_bulk_sector', {
		      	break_bulk_sector: break_bulk_sector
		    	});
		    }
		});
	},
	// Break Bulk Sector Edit Form End

	// Break Bulk Sector Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		let break_bulk_sector = {};
  		break_bulk_sector.name = req.body.name;
	  	break_bulk_sector.ref_id = req.body.ref_id;
	  	break_bulk_sector.status = req.body.status;
  		BreakBulkSector.update(query, break_bulk_sector, function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
    			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Edit',
			        table: 'Break Bulk Sectors'
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
	// Break Bulk Sector Update Data End

	// Break Bulk Sector Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		BreakBulkSector.findById(req.params.id, function(err, break_bulk_sector) {
    		if(break_bulk_sector) {
      		break_bulk_sector.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'Break Bulk Sectors'
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
	// Break Bulk Sector Delete Data End

	// Fetch Break Bulk Sectors Data Start
	fetch_break_bulk_sectors: function(req, res) {
		BreakBulkSector.find({}, function(err, break_bulk_sectors) {
			if(break_bulk_sectors) {
				res.send(break_bulk_sectors);
			}
		})
	}
	// Fetch Break Bulk Sectors Data End
}