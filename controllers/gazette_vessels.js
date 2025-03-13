const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('fast-csv');

// Bring in Gazette Vessel Model
let GazetteVessel = require('../models/gazetteVessel');
// Bring in Gazette Line Agent Model
let GazetteLineAgent = require('../models/gazetteLineAgent');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Gazette Vessels List Start
	list: function(req, res) {
  		res.render('gazette_vessels/list_gazette_vessel');
	},
	// Gazette Vessels List End

	// Get Gazette Vessels Data Start
	get_gazette_vessels: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var gazette_sector_search = req.body.columns[2].search.value;
	    var terminal_search = req.body.columns[3].search.value;
	    var service_search = req.body.columns[4].search.value;
	    var date_search = req.body.columns[5].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(gazette_sector_search) {
	    	gazette_sector_search = { $or: [{"gazette_sector_id": gazette_sector_search}]};
	    }
	    else {
	    	gazette_sector_search = {};
	    }

	    if(terminal_search) {
	    	terminal_search = { $or: [{"port_id": terminal_search}]};
	    }
	    else {
	    	terminal_search = {};
	    }

	    if(service_search) {
	    	service_search = { $or: [{"service_id": service_search}]};
	    }
	    else {
	    	service_search = {};
	    }

	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{ "item": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "desc_one": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "desc_two": { "$regex": req.body.search.value, "$options": "i" }},
	      						   // { "order": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   gazette_sector_search,
	      						   terminal_search,
	      						   service_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    GazetteVessel.count({}, function(err, c) {
	        recordsTotal=c;
	        GazetteVessel.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                GazetteVessel.find(searchStr, '_id gazette_sector_id port_id.name service_id date item desc_one desc_two order', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	                }).sort(column_order).populate('port_id', 'name');
	        
	          });
	   });
	},
	// Get Gazette Vessels Data End

	// Gazette Vessels Add Form Start
	add: function(req, res) {
  		res.render('gazette_vessels/add_gazette_vessel');
	},
	// Gazette Vessels Add Form End

	// Gazette Vessels View Data Start
	view_gazette_vessels: function(req, res) {

		const fileRows = [];

		// open uploaded file
  		csv.fromPath(req.file.path)
    	.on("data", function (data) {
      		fileRows.push(data); // push each row
      		// console.log(fileRows);
    	})
    	.on("end", function () {
      	fs.unlinkSync(req.file.path);   // remove temp file
      	res.send(fileRows);
    });
	},
	// Gazette Vessels View Data End

	// Gazette Vessels Store Data Start
	store: function(req, res) {
		// console.log(req.body);return false;
	  	const service_id = req.body.service_id;
	  	const date = req.body.date;
	  	const item = req.body.item;
	  	const desc_one = req.body.desc_one;
	  	const desc_two = req.body.desc_two;
	  	const order = req.body.order;

	    service_id.map(function(val, ind) {
			GazetteLineAgent.findOne({'service_id': val}).select('gazette_sector_id port_id -_id').then(gazette => {
				const gazette_sector_id = gazette.gazette_sector_id;
				const port_id = gazette.port_id;
			    let new_gazette_vessels = new GazetteVessel({
			      gazette_sector_id: gazette_sector_id,
			      port_id: port_id,
			      service_id: val,
			      date: date,
			      item: item[ind],
			      desc_one: desc_one[ind],
			      desc_two: desc_two[ind],
			      order: order[ind]
			    });
		        new_gazette_vessels.save(function(err) {
		          if(err) {
		            console.log(err);
		            // res.send('error|'+err);
		          }
		        });
	    	});
    		let new_log = new Log({
		        user_id: req.user._id,
		        message: 'Add',
		        table: 'gazette_vessels'
      		});

        	new_log.save(function(err, user) {
        		if(err) {
          			console.log('err '+err);
          			return res.send(err);
        		}
      		});
      	});
	        res.send('success|Record Inserted Successfully.');
	},
	// gazette_vessels Store Data End

	// gazette_vessel Edit Form Start
	/*edit: function(req, res) {
		gazette_vessel.findById(req.params.id, function(err, news) {
		    if(news) {
		      	res.render('news/edit_gazette_vessels', {
		      	gazette_vessels: gazette_vessel
		    	});
		    }
		});
	},*/
	// gazette_vessel Edit Form End

	// gazette_vessel Update Data Start
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
	// gazette_vessel Update Data End

	// gazette_vessel Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

      		GazetteVessel.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'gazette_vessels'
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
	// gazette_vessel Delete Data End

	// gazette_vessels Delete Multiple Data Start
	mult_delete: function(req, res) {
		if(req.body.mult_check.length > 0) {
			var gazette_vessels_id = req.body.mult_check.split(',');
			gazette_vessels_id.map(function(gazette_vessel_id) {

		  		let query = {_id: gazette_vessel_id}
		      		GazetteVessel.remove(query, function(err) {
		        		if(err) {
		          			console.log(err);
		          			// res.send('error|'+err);
		        		}
		      		});
			});
				let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Multiple Delete',
			        table: 'gazette_vessels'
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
	// gazette_vessels Multiple Delete Data End
}