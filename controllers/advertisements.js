const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in Advertisement Model
let Advertisement = require('../models/advertisement');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Advertisements List Start
	list: function(req, res) {
  		res.render('advertisements/list_advertisements');
	},
	// Advertisements List End

	// Get Advertisements Data Start
	get_advertisements: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var status_search = req.body.columns[5].search.value;
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
	    	var common_search = { $or: [{"category": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "url": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "order": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    Advertisement.count({}, function(err, c) {
	        recordsTotal=c;
	        Advertisement.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Advertisement.find(searchStr, '_id category image url video status order', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Advertisements Data End

	// Advertisement Add Form Start
	add: function(req, res) {
  		res.render('advertisements/add_advertisement');
	},
	// Advertisement Add Form End

	// Advertisement Store Data Start
	store: function(req, res) {
		// console.log(req.files);return false;
	  	const category = req.body.category;
	  	const url = req.body.url;
	  	const status = req.body.status;
    	const image =  (req.files.image !== undefined) ? 'http://eximindiaonline.in:3000/uploads/advertisements/images/'+req.files.image[0].filename : '';
    	const video = (req.files.video !== undefined) ? 'http://eximindiaonline.in:3000/uploads/advertisements/videos/'+req.files.video[0].filename : '';
    	const order = req.body.order;

	    let new_advertisement = new Advertisement({
	      category: category,
	      url: (url != undefined) ? url : '',
	      status: status,
	      image: image,
	      video: video,
	      order: order
	    });

        new_advertisement.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'advertisements'
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
	// Advertisement Store Data End

	// Advertisement Edit Form Start
	edit: function(req, res) {
		Advertisement.findById(req.params.id, function(err, advertisement) {
		    if(advertisement) {
		      	res.render('advertisements/edit_advertisement', {
		      	advertisement: advertisement
		    	});
		    }
		});
	},
	// Advertisement Edit Form End

	// Advertisement Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

        Advertisement.findById(req.params.id, function(err, advertisement) {
	    	if(advertisement) {
		  		advertisement.category = req.body.category;
		        advertisement.status = req.body.status;
		        advertisement.url = (req.body.url != undefined) ? req.body.url : '';
		        advertisement.order = req.body.order;
		        /*if(req.files.image !== undefined) {
	    			if(advertisement.image !== '') {
	    				var image = advertisement.image.split('/');
	    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5]+'/'+image[6];
						// console.log(image);
		    			fs.unlink(image, function (err) {
						    if (err) { 
						    	console.log(err);
						    }
						    // if no error, file has been deleted successfully
						    console.log('File deleted!');return false;
						});
	    			}
    				advertisement.image = 'http://eximindiaonline.in:3000/uploads/advertisements/images/'+req.files.image[0].filename;
		    	}*/

        // console.log(advertisements);return false;
  		advertisement.save(function(err) {
    		if(err) {
      			console.log(err);
      			res.send('error|'+err);
    		} else {
    			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Edit',
			        table: 'advertisements'
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
	// Advertisement Update Data End

	// Advertisement Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Advertisement.findById(req.params.id, function(err, advertisement) {
    		if(advertisement) {
    			if(advertisement.image != '') {
    				var image = advertisement.image.split('/');
    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5]+'/'+image[6];
					// console.log(image);return false;
	    			fs.unlink(image, function (err) {
					    if (err) { 
					    	// throw err;
					    	console.log(err);
					    	return res.send('error|'+err);
					    }
					    // if no error, file has been deleted successfully
					    console.log('Image deleted!');
					});
    			}
    			if(advertisement.video != '') {
    				var video = advertisement.video.split('/');
    				video = './public/'+video[3]+'/'+video[4]+'/'+video[5]+'/'+video[6];
					// console.log(image);return false;
	    			fs.unlink(video, function (err) {
					    if (err) { 
					    	// throw err;
					    	console.log(err);
					    	return res.send('error|'+err);
					    }
					    // if no error, file has been deleted successfully
					    console.log('Video deleted!');
					});
    			}
      		Advertisement.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Delete',
			        table: 'advertisements'
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
	// Advertisement Delete Data End
}