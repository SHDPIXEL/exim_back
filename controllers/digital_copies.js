const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in Digital Copy Model
let DigitalCopy = require('../models/digitalCopy');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Digital Copies List Start
	list: function(req, res) {
  		res.render('digital_copies/list_digital_copy');
	},
	// Digital Copies List End

	// Get Digital Copies Data Start
	get_digital_copies: function(req, res) {
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
	      						   		{ "url": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    DigitalCopy.count({}, function(err, c) {
	        recordsTotal=c;
	        DigitalCopy.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                DigitalCopy.find(searchStr, '_id name url image status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Digital Copies Data End

	// Digital Copy Add Form Start
	add: function(req, res) {
  		res.render('digital_copies/add_digital_copy');
	},
	// Digital Copy Add Form End

	// Digital Copy Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const url = req.body.url;
	  	const status = req.body.status;
    	const image = (req.file !== undefined) ? 'http://eximindiaonline.in:3000/uploads/digital_copies/'+req.file.filename : '';

		    let new_digital_copy = new DigitalCopy({
		      name: name,
		      url: url,
		      status: status,
		      image: image
		    });

	        new_digital_copy.save(function(err) {
	          if(err) {
	            console.log(err);
	            res.send('error|'+err);
	          } else {
	          	let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'digital_copies'
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
	// Digital Copy Store Data End

	// Digital Copy Edit Form Start
	edit: function(req, res) {
		DigitalCopy.findById(req.params.id, function(err, digital_copy) {
		    if(digital_copy) {
		      	res.render('digital_copies/edit_digital_copy', {
		      	digital_copy: digital_copy
		    	});
		    }
		});
	},
	// Digital Copy Edit Form End

	// Digital Copy Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

    		DigitalCopy.findById(req.params.id, function(err, digital_copy) {
	    		if(digital_copy) {
			  		digital_copy.name = req.body.name;
			        digital_copy.url = req.body.url;
			        digital_copy.status = req.body.status;
			        if(req.file !== undefined) {
		    			if(digital_copy.image !== '') {
		    				var image = digital_copy.image.split('/');
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
	    				digital_copy.image = 'http://eximindiaonline.in:3000/uploads/digital_copies/'+req.file.filename;
			    	}

			        // console.log(digital_copys);return false;
			  		digital_copy.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'digital_copies'
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
	// Digital Copy Update Data End

	// Digital Copy Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		DigitalCopy.findById(req.params.id, function(err, digital_copy) {
    		if(digital_copy) {
    			if(digital_copy.image != '') {
    				var image = digital_copy.image.split('/');
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
      		DigitalCopy.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'digital_copies'
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
	// Digital Copy Delete Data End
}