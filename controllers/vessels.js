const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('fast-csv');

// Bring in Vessel Model
let Vessel = require('../models/vessel');
// Bring in Vessel Model
let LineAgent = require('../models/lineAgent');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Vessels List Start
	list: function(req, res) {
  		res.render('vessels/list_vessel');
	},
	// Vessels List End

	// Get Vessels Data Start
	get_vessels: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var sector_search = req.body.columns[2].search.value;
	    var terminal_search = req.body.columns[4].search.value;
	    var date_search = req.body.columns[6].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(sector_search) {
	    	sector_search = { $or: [{"sector_ref_id": sector_search}]};
	    }
	    else {
	    	sector_search = {};
	    }
	    if(terminal_search) {
	    	terminal_search = { $or: [{"port_ref_id": terminal_search}]};
	    }
	    else {
	    	terminal_search = {};
	    }
	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{ "sector_ref_id": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "port_ref_id": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "eta": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "etd": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "cy_cut_off_date_time": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "vessel_name_via_no": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "voy_no": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "rot_no_date": { "$regex": req.body.search.value, "$options": "i" }},
	      						   /*{ "line": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "agent": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "carting_point": { "$regex": req.body.search.value, "$options": "i" }},*/
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   sector_search,
	      						   terminal_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Vessel.count({}, function(err, c) {
	        recordsTotal=c;
	        Vessel.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Vessel.find(searchStr, '_id sector_id.name sector_ref_id port_id.name port_ref_id date eta etd cy_cut_off_date_time vessel_name_via_no voy_no rot_no_date', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order).populate('sector_id', 'name').populate('port_id', 'name');
	        
	          });
	   });
	},
	// Get Vessels Data End

	// Vessel Add Form Start
	add: function(req, res) {
  		res.render('vessels/add_vessel');
	},
	// Vessel Add Form End

	// Vessel View Data Start
	view_vessels: function(req, res) {

		const fileRows = [];

		// open uploaded file
  		csv.fromPath(req.file.path)
    	.on("data", function (data) {

    		if(data[6] == '1') {
    			var sector_id = '5d0cc282685dd619acec11d4';
    		} else if(data[6] == '2') {
    			sector_id = '5d0cc2ab685dd619acec11d5';
    		} else if(data[6] == '3') {
    			sector_id = '5d0cc2bf685dd619acec11d6';
    		} else if(data[6] == '4') {
    			sector_id = '5d0cc2cf685dd619acec11d7';
    		} else if(data[6] == '5') {
    			sector_id = '5d0cc2eb685dd619acec11d8';
    		} else if(data[6] == '6') {
    			sector_id = '5d0cc315685dd619acec11d9';
    		} else if(data[6] == '7') {
    			sector_id = '5d0cc328685dd619acec11da';
    		} else if(data[6] == '8') {
    			sector_id = '5d0cc331685dd619acec11db';
    		} else if(data[6] == '9') {
    			sector_id = '5d63c386acc50f37055605e8';
    		}
    		data.push(sector_id);

    		if(data[7] == '1') {
    			var port_id = '5d0cc5dbc5356a1ed83118fb';
    		} else if(data[7] == '2') {
    			port_id = '5d0cc5e7c5356a1ed83118fc';
    		} else if(data[7] == '3') {
    			port_id = '5d0cc5f1c5356a1ed83118fd';
    		} else if(data[7] == '4') {
    			port_id = '5d0cc5fbc5356a1ed83118fe';
    		} else if(data[7] == '5') {
    			port_id = '5d5d17e3c3704811e52b66ef';
    		}
    		data.push(port_id);
      		fileRows.push(data); // push each row
      		// console.log(fileRows);
    	})
    	.on("end", function () {
      	fs.unlinkSync(req.file.path);   // remove temp file
      	res.send(fileRows);
    });
	},
	// Vessel View Data End

	// Vessels Store Data Start
	store: function(req, res) {
		// console.log(req.body);return false;
	  	const date = req.body.date;
	  	const eta = req.body.eta;
	  	const etd = req.body.etd;
	  	const cy_cut_off_date_time = req.body.cy_cut_off_date_time;
	  	const vessel_name_via_no = req.body.vessel_name_via_no;
	  	const voy_no = req.body.voy_no;
    	const rot_no_date = req.body.rot_no_date;
    	// const line = req.body.line;
    	// const agent = req.body.agent;
    	// const carting_point = req.body.carting_point;
    	const sector_ref_id = req.body.sector_ref_id;
    	const port_ref_id = req.body.port_ref_id;
    	const sector_id = req.body.sector_id;
    	const port_id = req.body.port_id;

    	eta.map(function(val, ind) {
		    let new_vessels = new Vessel({
		      date: date,
		      eta: val,
		      etd: etd[ind],
		      cy_cut_off_date_time: cy_cut_off_date_time[ind],
		      vessel_name_via_no: vessel_name_via_no[ind],
		      voy_no: voy_no[ind],
		      rot_no_date: rot_no_date[ind],
		      // line: line[ind],
		      // agent: agent[ind],
		      // carting_point: carting_point[ind],
		      sector_ref_id: sector_ref_id[ind],
		      port_ref_id: port_ref_id[ind],
		      sector_id: sector_id[ind],
		      port_id: port_id[ind]
		    });
	        new_vessels.save(function(err) {
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
	// Vessels Store Data End

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

	// Vessel Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

      		Vessel.remove(query, function(err) {
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
	// Vessel Delete Data End

	// Vessel Delete Multiple Data Start
	mult_delete: function(req, res) {
		if(req.body.mult_check.length > 0) {
			var vessels_id = req.body.mult_check.split(',');
			vessels_id.map(function(vessel_id) {

		  		let query = {_id: vessel_id}
		      		Vessel.remove(query, function(err) {
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
	// Vessel Multiple Delete Data End
}