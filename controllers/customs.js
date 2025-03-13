const express = require('express');
const router = express.Router();
const sql = require("mssql");

	sql.close();
	// config for your database
	var config = {
	    user: 'exim07',
	    password: 'Asiapacific@2021',
	    // password: 'nFw10!k0',
	    // server: '50.115.114.109',
	    server: '103.21.58.193', 
	    database: 'eximindia',
	    // port: 1434
	 };

	// connect to your database
	sql.connect(config, function (err) {
	    if (err) console.log(err);
	});

// Bring in Customs Model
let Custom = require('../models/customs');
// Bring in Currency Model
let Currency = require('../models/currency');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Customs List Start
	list: function(req, res) {
  		res.render('customs/list_custom');
	},
	// Customs List End

	// Get Customs Data Start
	get_customs: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var date_search = req.body.columns[4].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(date_search) {
	    	date_search = { $or: [{"date": date_search}]};
	    }
	    else {
	    	date_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"currency": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "import": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "export": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "notification_no": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "sql_id": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   date_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    Custom.count({}, function(err, c) {
	        recordsTotal=c;
	        Custom.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Custom.find(searchStr, '_id currency import export date notification_no sql_id', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Customs Data End

	// Customs Add Form Start
	add: function(req, res) {
		Currency.find({}, function(err, currencies) {
			if(err) {
				console.log('error', err);
				return res.send('error|'+err);
			}
  			res.render('customs/add_custom', {
  				currencies: currencies
  			});
		});
	},
	// Customs Add Form End

	// Customs Store Data Start
	store: function(req, res) {
	  	const currency = req.body.currency;
	  	const importt = req.body.import;
	  	const exportt = req.body.export;
	  	const date = req.body.date;
	  	const notification_no = req.body.notification_no;

	  	// create Request object
		var request = new sql.Request();

		var count = 1;
	  	currency.map(function(val, ind) {

		// query to the database and get the records
		request.query("INSERT INTO Custom_Rates (currency_name, import, export, upd_date, notification_no, currency_display, curr_id) VALUES ('"+val+"', '"+importt[ind]+"', '"+exportt[ind]+"', '"+date+"', '"+notification_no+"', 1, '"+count+"')", function (err) {
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }
		    request.query("SELECT @@IDENTITY AS id", function(error, recordset) {

		    	// console.log(recordset.recordset[0].id);

			    let new_custom = new Custom({
			      currency: val,
			      import: importt[ind],
			      export: exportt[ind],
			      date: date,
			      notification_no: notification_no,
			      // sql_id: ''
			      sql_id: recordset.recordset[0].id
			    });
		        new_custom.save(function(err) {
		          if(err) {
		            console.log(err);
		            // res.send('error|'+err);
		          }
		        });
	  		});
		  		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'customs'
	      		});

	        	new_log.save(function(err, user) {
	        		if(err) {
	          			console.log('err '+err);
	          			return res.send(err);
	        		}
	      		});
      		});
		count++;
		});
		// return false;
	        res.send('success|Record Inserted Successfully.');
	},
	// Customs Store Data End

	// Custom Edit Form Start
	edit: function(req, res) {
		Currency.find({}, function(err, currencies) {
			Custom.findOne({'sql_id': req.params.id}, function(err, custom) {
		    	if(custom) {
		      		res.render('customs/edit_custom', {
		      			custom: custom,
		      			currencies: currencies
		    		});
		    	}
			});
		});
	},
	// Custom Edit Form End

	// Custom Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

  		// create Request object
		var request = new sql.Request();

		// query to the database and get the records
		request.query("UPDATE Custom_Rates SET currency_name = '"+req.body.currency+"', import = '"+req.body.import+"', export = '"+req.body.export+"', upd_date = '"+req.body.date+"', notification_no = '"+req.body.notification_no+"' WHERE Id = "+req.params.id+"", function (err) {
		      
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }

			Custom.findOne({'sql_id': req.params.id}, function(err, custom) {
	    		if(custom) {
			  		custom.currency = req.body.currency;
			        custom.import = req.body.import;
			        custom.export = req.body.export;
			        custom.date = req.body.date;
			        custom.notification_no = req.body.notification_no;
			  		custom.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'customs'
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
		});
	},
	// Custom Update Data End

	// Custom Delete Data Start
	delete: function(req, res) {
  		let query = {'sql_id': req.params.id}

  		// create Request object
		var request = new sql.Request();

		// query to the database and get the records
		request.query("DELETE FROM Custom_Rates WHERE Id = "+req.params.id+"", function (err) {
		      
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }

	  		Custom.findOne({'sql_id': req.params.id}, function(err, custom) {
	    		if(custom) {
	      		Custom.remove(query, function(err) {
	        		if(err) {
	          			console.log(err);
	          			res.send('error|'+err);
	        		} else {
	        			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete',
					        table: 'customs'
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
	  	});
	}
	// Custom Delete Data End
}