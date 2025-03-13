const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in About Model
let About = require('../models/about');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// About Add Edit Form Start
	add_edit: function(req, res) {
		About.findOne({}, function(err, about) {
			if(about) {
	  			res.render('about/add_edit_about', {
	  				about: about
	  			});
			}
		});
	},
	// About Add Edit Form End

	// About Store Update Data Start
	store_update: function(req, res) {
		const about_id = req.body.about_id;
		if(about_id == '') {
		  	const description = req.body.description;
		  	const readers = req.body.readers;
	    	const networks = (req.files.image !== undefined) ? 'http://eximindiaonline.in:3000/uploads/about/networks/'+req.files.image[0].filename : '';
		    let new_about = new About({
		      description: description,
		      readers: readers,
		      networks: networks
		    });

		    if(req.files['edition_images[]'] != undefined) {
		    	const name = req.body.name;
		    	req.files['edition_images[]'].map(function(image, ind) {
		    		let edition = {};
		    		edition.image = 'http://eximindiaonline.in:3000/uploads/about/editions/'+image.filename;
		    		edition.name = name[ind];
		    		editions.push(edition);
		    	});
		    }

	        new_about.save(function(err) {
	          if(err) {
	            console.log(err);
	            res.send('error|'+err);
	          } else {
	          	let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'abouts'
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
		} else {
			About.findOne({}, function(err, about) {
				if(about) {
					about.description = req.body.description;
					about.readers = req.body.readers;
					if(req.files.image !== undefined) {
	    			if(about.networks !== '') {
	    				var image = about.networks.split('/');
	    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5]+'/'+image[6];
						// console.log(image);
		    			fs.unlink(image, function (err) {
						    if (err) { 
						    	console.log(err);
						    }
						    // if no error, file has been deleted successfully
						    console.log('File deleted!');
						});
	    			}
    				about.networks = 'http://eximindiaonline.in:3000/uploads/about/networks/'+req.files.image[0].filename;
    				// console.log(req.files.image[0].filename);return false;
		    		}
		    		if(req.files['edition_images[]'] != undefined) {
				    	const name = req.body.name;
				    	req.files['edition_images[]'].map(function(image, ind) {
				    		let edition = {};
				    		edition.image = 'http://eximindiaonline.in:3000/uploads/about/editions/'+image.filename;
				    		edition.name = name[ind];
				    		about.editions.unshift(edition);
				    	});
				    }
		    		about.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'abouts'
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
	},
	// About Store Update Data Start

	// About Edition Image Delete Data Start
	delete_edition_image: function(req, res) {
  		About.findOne({}, function(err, about) {
    		if(about) {
    			// console.log(about.editions.length);return false;
			    // for(var i = 0; i <= about.editions.length; i++) {
			    	about.editions.map(function(edition, ind) {
			        if (JSON.stringify(edition._id) == JSON.stringify(req.params.id)) {
			            // console.log(edition.image);
			            var image = edition.image.split('/');
						image = './public/'+image[3]+'/'+image[4]+'/'+image[5]+'/'+image[6];
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
			    });
			        // return false;
    			about.editions.pull({"_id": req.params.id});
			    about.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete Edition Image',
					        table: 'abouts'
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
				/*var image = about.editions.split('/');
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
	      		News.remove(query, function(err) {
	        		if(err) {
	          			console.log(err);
	          			res.send('error|'+err);
	        		} else {
	          			res.send('success|Record Deleted Successfully.');
	        		}
	      		});*/
	    	// }
			}
		});
 	}
	// About Edition Image Delete Data End
}