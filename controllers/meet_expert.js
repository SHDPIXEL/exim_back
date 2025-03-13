const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in Meet Expert Model
let MeetExpert = require('../models/meetExpert');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Meet Expert Add Edit Form Start
	add_edit: function(req, res) {
		MeetExpert.findOne({}, function(err, meet_expert) {
			// if(meet_expert) {
	  			res.render('meet_expert/add_edit_meet_expert', {
	  				meet_expert: meet_expert || {}
	  			});
			/*} else {
				console.log(';;;');return false;
				res.render('meet_expert/add_edit_meet_expert', {
					meet_expert: {}
				});
			}*/
		});
	},
	// Meet Expert Add Edit Form End

	// Meet Expert Store Update Data Start
	store_update: function(req, res) {
		const meet_expert_id = req.body.meet_expert_id;
		if(meet_expert_id == '') {
			// console.log(req.file);return false;
		  	const description = req.body.description;
	    	const image = (req.file !== undefined) ? 'http://eximindiaonline.in:3000/uploads/meet_expert/'+req.file.filename : '';
		    let new_meet_expert = new MeetExpert({
		      description: description,
		      image: image
		    });

	        new_meet_expert.save(function(err) {
	          if(err) {
	            console.log(err);
	            res.send('error|'+err);
	          } else {
	          	let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'meet_expert'
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
			MeetExpert.findOne({}, function(err, meet_expert) {
				if(meet_expert) {
					meet_expert.description = req.body.description;
					if(req.file !== undefined) {
	    			if(meet_expert.image !== '') {
	    				var image = meet_expert.image.split('/');
	    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5];
						// console.log(image);
		    			fs.unlink(image, function (err) {
						    if (err) { 
						    	console.log(err);
						    }
						    // if no error, file has been deleted successfully
						    console.log('File deleted!');
						});
	    			}
    				meet_expert.image = 'http://eximindiaonline.in:3000/uploads/meet_expert/'+req.file.filename;
    				// console.log(req.files.image[0].filename);return false;
		    		}
		    		meet_expert.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'meet_expert'
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
	// Meet Expert Store Update Data Start
}