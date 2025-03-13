const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('fast-csv');

// Bring in Break Bulk Vessel Model
let BreakBulkVessel = require('../models/breakBulkVessel');
// Bring in Break Bulk Vessel Model
let LineAgent = require('../models/lineAgent');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Break Bulk Vessels List Start
	list: function(req, res) {
  		res.render('break_bulk_vessels/list_break_bulk_vessel');
	},
	// Break Bulk Vessels List End

	// Get Break Bulk Vessels Data Start
	get_break_bulk_vessels: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var break_bulk_sector_search = req.body.columns[2].search.value;
	    // var terminal_search = req.body.columns[4].search.value;
	    var date_search = req.body.columns[4].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(break_bulk_sector_search) {
	    	break_bulk_sector_search = { $or: [{"break_bulk_sector_ref_id": break_bulk_sector_search}]};
	    }
	    else {
	    	break_bulk_sector_search = {};
	    }
	    /*if(terminal_search) {
	    	terminal_search = { $or: [{"port_ref_id": terminal_search}]};
	    }
	    else {
	    	terminal_search = {};
	    }*/
	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{ "break_bulk_sector_ref_id": { "$regex": req.body.search.value, "$options": "i" }},
	      						   // { "port_ref_id": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "eta": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "etd": { "$regex": req.body.search.value, "$options": "i" }},
	      						   // { "cy_cut_off_date_time": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "vessel_name_via_no": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "voy_no": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "rot_no_date": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "line": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "agent": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "carting_point": { "$regex": req.body.search.value, "$options": "i" }},
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   break_bulk_sector_search,
	      						   // terminal_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    BreakBulkVessel.count({}, function(err, c) {
	        recordsTotal=c;
	        BreakBulkVessel.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                BreakBulkVessel.find(searchStr, '_id break_bulk_sector_id.name break_bulk_sector_ref_id date eta etd vessel_name_via_no voy_no rot_no_date line agent carting_point', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order).populate('break_bulk_sector_id', 'name');
	        
	          });
	   });
	},
	// Get Break Bulk Vessels Data End

	// Break Bulk Vessel Add Form Start
	add: function(req, res) {
  		res.render('break_bulk_vessels/add_break_bulk_vessel');
	},
	// Break Bulk Vessel Add Form End

	// Break Bulk Vessel View Data Start
	view_break_bulk_vessels: function(req, res) {

		const fileRows = [];

		// open uploaded file
  		csv.fromPath(req.file.path)
    	.on("data", function (data) {

    		/*if(data[7] == '1') {
    			var sector_id = '5d0cc282685dd619acec11d4';
    		} else if(data[7] == '2') {
    			sector_id = '5d0cc2ab685dd619acec11d5';
    		} else if(data[7] == '3') {
    			sector_id = '5d0cc2bf685dd619acec11d6';
    		} else if(data[7] == '4') {
    			sector_id = '5d0cc2cf685dd619acec11d7';
    		} else if(data[7] == '5') {
    			sector_id = '5d0cc2eb685dd619acec11d8';
    		} else if(data[7] == '6') {
    			sector_id = '5d0cc315685dd619acec11d9';
    		} else if(data[7] == '7') {
    			sector_id = '5d0cc331685dd619acec11db';
    		} else if(data[7] == '8') {
    			sector_id = '5d0cc328685dd619acec11da';
    		}
    		data.push(sector_id);*/

    		if(data[8] == '1') {
    			var sector_id = '5d5d081ac5c7797eb353a5ad';
    		} else if(data[8] == '2') {
    			sector_id = '5d5d085ec5c7797eb353a5af';
    		} else if(data[8] == '3') {
    			sector_id = '5d5d089dc5c7797eb353a5b1';
    		} else if(data[8] == '4') {
    			sector_id = '5d5d08b6c5c7797eb353a5b3';
    		} else if(data[8] == '5') {
    			sector_id = '5d5d08dac5c7797eb353a5b5';
    		}
    		data.push(sector_id);
      		fileRows.push(data); // push each row
      		// console.log(fileRows);
    	})
    	.on("end", function () {
      	fs.unlinkSync(req.file.path);   // remove temp file
      	res.send(fileRows);
    });
	},
	// Break Bulk Vessel View Data End

	// Break Bulk Vessels Store Data Start
	store: function(req, res) {
		// console.log(req.body);return false;
	  	const date = req.body.date;
	  	const eta = req.body.eta;
	  	const etd = req.body.etd;
	  	// const cy_cut_off_date_time = req.body.cy_cut_off_date_time;
	  	const vessel_name_via_no = req.body.vessel_name_via_no;
	  	const voy_no = req.body.voy_no;
    	const rot_no_date = req.body.rot_no_date;
    	const line = req.body.line;
    	const agent = req.body.agent;
    	const carting_point = req.body.carting_point;
    	const break_bulk_sector_ref_id = req.body.break_bulk_sector_ref_id;
    	// const port_ref_id = req.body.port_ref_id;
    	const break_bulk_sector_id = req.body.break_bulk_sector_id;
    	// const port_id = req.body.port_id;

    	eta.map(function(val, ind) {
		    let new_break_bulk_vessels = new BreakBulkVessel({
		      date: date,
		      eta: val,
		      etd: etd[ind],
		      // cy_cut_off_date_time: cy_cut_off_date_time[ind],
		      vessel_name_via_no: vessel_name_via_no[ind],
		      voy_no: voy_no[ind],
		      rot_no_date: rot_no_date[ind],
		      line: line[ind],
		      agent: agent[ind],
		      carting_point: carting_point[ind],
		      break_bulk_sector_ref_id: break_bulk_sector_ref_id[ind],
		      // port_ref_id: port_ref_id[ind],
		      break_bulk_sector_id: break_bulk_sector_id[ind],
		      // port_id: port_id[ind]
		    });
	        new_break_bulk_vessels.save(function(err) {
	          if(err) {
	            console.log(err);
	            // res.send('error|'+err);
	          }
	        });
    	});
    		let new_log = new Log({
		        user_id: req.user._id,
		        message: 'Add',
		        table: 'vessels'
      		});

        	new_log.save(function(err, user) {
        		if(err) {
          			console.log('err '+err);
          			return res.send(err);
        		}
      		});
	        res.send('success|Record Inserted Successfully.');
	},
	// Break Bulk Vessels Store Data End

	// Vessel Edit Form Start
	/*edit: function(req, res) {
		Vessel.findById(req.params.id, function(err, news) {
		    if(news) {
		      	res.render('news/edit_vessels', {
		      	vessels: vessel
		    	});
		    }
		});
	},*/
	// Vessel Edit Form End

	// Vessel Update Data Start
	/*update: function(req, res) {
  		let query = {_id: req.params.id}

  		let news = {};
  		news.category_id = req.body.category_id;
        news.date = req.body.date;
        news.headline = req.body.headline;
        news.link_url = req.body.link_url;
        news.description = req.body.description;
        news.four_lines = req.body.four_lines;
        if(req.file !== undefined) {
        	News.findById(req.params.id, function(err, newss) {
    		if(newss) {
    			if(newss.image !== '') {
    				var image = newss.image.split('/');
    				image = './public/'+image[3]+'/'+image[4];
					console.log(image);
	    			fs.unlink(image, function (err) {
					    if (err) { 
					    	console.log(err);
					    }
					    // if no error, file has been deleted successfully
					    console.log('File deleted!');return false;
					});
    			}
    		}
    		});

    		news.image = 'http://localhost:3000/uploads/'+req.file.filename;
        }
        // console.log(news);return false;
  		News.update(query, news, function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
      			res.send('success|Record Updated Successfully.');
    		}
  		});
	},*/
	// Vessel Update Data End

	// Break Bulk Vessel Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

      		BreakBulkVessel.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'vessels'
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
	},
	// Break Bulk Vessel Delete Data End

	// Break Bulk Vessels Delete Multiple Data Start
	mult_delete: function(req, res) {
		if(req.body.mult_check.length > 0) {
			var break_bulk_vessels_id = req.body.mult_check.split(',');
			break_bulk_vessels_id.map(function(break_bulk_vessel_id) {

		  		let query = {_id: break_bulk_vessel_id}
		      		BreakBulkVessel.remove(query, function(err) {
		        		if(err) {
		          			console.log(err);
		          			// res.send('error|'+err);
		        		}
		      		});
			});
				let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Multiple Delete',
			        table: 'vessels'
	      		});

	        	new_log.save(function(err, user) {
	        		if(err) {
	          			console.log('err '+err);
	          			return res.send(err);
	        		}
	      		});
		        res.send('success|Record Deleted Successfully.');
		} else {
			res.send('error|Atleast Select One Record.');
		}
	}
	// Break Bulk Vessels Multiple Delete Data End
}