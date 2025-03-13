const express = require('express');
const router = express.Router();

// Bring in Currency Model
let Currency = require('../models/currency');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Currencies List Start
	list: function(req, res) {
  		res.render('currencies/list_currency');
	},
	// Currencies List End

	// Get Currencies Data Start
	get_currencies: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var status_search = req.body.columns[2].search.value;
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
	    	var common_search = { $or: [{"currency": { "$regex": req.body.search.value, "$options": "i" }}
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
	    
	    Currency.count({}, function(err, c) {
	        recordsTotal=c;
	        Currency.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Currency.find(searchStr, '_id currency status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Currencies Data End

	// Currency Add Form Start
	add: function(req, res) {
  			res.render('currencies/add_currency');
	},
	// Currency Add Form End

	// Currency Store Data Start
	store: function(req, res) {
	  	const currency = req.body.currency;
	  	const status = req.body.status;

	  	Currency.findOne({'currency': currency}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Currency Already Exist.');
	  		} else {
			    let new_currency = new Currency({
			      currency: currency,
			      status: status
			    });

		        new_currency.save(function(err) {
		          if(err) {
		            console.log(err);
		            res.send('error|'+err);
		          } else {
		          	let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Add',
				        table: 'currencies'
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
    		}
		});
	},
	// Currency Store Data End

	// Currency Edit Form Start
	edit: function(req, res) {
		Currency.findById(req.params.id, function(err, currency) {
		    if(currency) {
		      	res.render('currencies/edit_currency', {
		      	currency: currency
		    	});
		    }
		});
	},
	// Currency Edit Form End

	// Currency Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		Currency.findOne({ $and: [{'currency': req.body.currency}, {'_id': { $ne: req.params.id}}]}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Currency Already Exist.');
	  		} else {
		  		let currency = {};
		  		currency.currency = req.body.currency;
			  	currency.status = req.body.status;
		  		Currency.update(query, currency, function(err) {
		    		if(err) {
		      			console.log(err);
		      			res.send('error|'+err);
		    		} else {
		    			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Edit',
					        table: 'currencies'
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
	// Currency Update Data End

	// Currency Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

  		Currency.findById(req.params.id, function(err, currency) {
    		if(currency) {
      		Currency.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'currencies'
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
	// Currency Delete Data End

	// Fetch Currencies Data Start
	fetch_currencies: function(req, res) {
		Currency.find({}, function(err, currencies) {
			if(currencies) {
				res.send(currencies);
			}
		})
	}
	// Fetch Currencies Data End
}