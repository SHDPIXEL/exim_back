const express = require('express');
const router = express.Router();

// Bring in Contacts Model
let Contact = require('../models/contact');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Contacts List Start
	list: function(req, res) {
  		res.render('contacts/list_contact');
	},
	// Contacts List End

	// Get Contacts Data Start
	get_contacts: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var office_search = req.body.columns[1].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(office_search) {
	    	office_search = { $or: [{"office": office_search}]};
	    }
	    else {
	    	office_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"type": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "address": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "telephone": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "fax": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   office_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Contact.count({}, function(err, c) {
	        recordsTotal=c;
	        Contact.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Contact.find(searchStr, '_id office type address telephone fax', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Contacts Data End

	// Contact Add Form Start
	add: function(req, res) {
  		res.render('contacts/add_contact');
	},
	// Contact Add Form End

	// Contact Store Data Start
	store: function(req, res) {
	  	const office = req.body.office;
	  	const type = req.body.type;
	  	const address = req.body.address;
	  	const telephone = req.body.telephone;
	  	const fax = req.body.fax;
	  	const email = req.body.email;

	    let new_contact = new Contact({
	      office: office,
	      type: type,
	      address: address,
	      telephone: telephone,
	      fax: fax
	    });

		if(email != '') {
		    email.map(function(val, ind) {
		    	if(val != '') {
		    		let emaill = {};
		    		emaill.email = val;
		    		new_contact.emails.unshift(emaill);
		    	}
		    });
		}

        new_contact.save(function(err) {
          if(err) {
            console.log(err);
            res.send('error|'+err);
          } else {
          		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'contacts'
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
	// Contact Store Data End

	// Contact Edit Form Start
	edit: function(req, res) {
		Contact.findById(req.params.id, function(err, contact) {
		    if(contact) {
		      	res.render('contacts/edit_contact', {
		      	contact: contact
		    	});
		    }
		});
	},
	// Contact Edit Form End

	// Contact Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

		Contact.findById(req.params.id, function(err, contact) {
    		if(contact) {
		  		contact.office = req.body.office;
		        contact.type = req.body.type;
		        contact.address = req.body.address;
		        contact.telephone = req.body.telephone;
		        contact.fax = req.body.fax;
		        const email = req.body.email;

		        if(email != '') {
			        email.map(function(val, ind) {
				    	if(val != '') {
				    		let emaill = {};
				    		emaill.email = val;
				    		contact.emails.unshift(emaill);
				    	}
				    });
		    	}

		  		contact.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Edit',
					        table: 'contacts'
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
	// Contact Update Data End

	// Contact Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		Contact.findById(req.params.id, function(err, contact) {
    		if(contact) {
      		Contact.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'contacts'
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
	// Contact Delete Data End

	// Contact Email Delete Data Start
	email_delete: function(req, res) {
  		Contact.findById(req.params.contact_id, function(err, contact) {
  			// console.log(contact);return false;
    		if(contact) {
      			contact.emails.pull({'_id': req.params.email_id});
      			contact.save(function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete Email',
					        table: 'contacts'
			      		});

			        	new_log.save(function(err, user) {
			        		if(err) {
			          			console.log('err '+err);
			          			return res.send(err);
			        		}
			      		});
		      			res.send('success|Email Deleted Successfully.');
		    		}
			  	});
    		}
  		});
	}
	// Contact Email Delete Data End
}