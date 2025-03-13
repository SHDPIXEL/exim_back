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

// Bring in Forexes Model
let Forex = require('../models/forex');
// Bring in Currency Model
let Currency = require('../models/currency');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Forexes List Start
	list: function(req, res) {
  		res.render('forexes/list_forex');
	},
	// Forexes List End

	// Get Forexes Data Start
	get_forexes: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var date_search = req.body.columns[2].search.value;
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
	      						   { "tt_selling_rates_clean_remittance_outwards": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "bill_selling_rates_for_imports": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "tt_buying_rates_clean_remittance_inwards": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "bill_buying_rates_for_exports": { "$regex": req.body.search.value, "$options": "i" }},
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
	    
	    Forex.count({}, function(err, c) {
	        recordsTotal=c;
	        Forex.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                Forex.find(searchStr, '_id sql_id currency tt_selling_rates_clean_remittance_outwards bill_selling_rates_for_imports tt_buying_rates_clean_remittance_inwards bill_buying_rates_for_exports date', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Forexes Data End

	// Forex Add Form Start
	add: function(req, res) {
		Currency.find({}, function(err, currencies) {
			if(err) {
				console.log('error', err);
				return res.send('error|'+err);
			}
  			res.render('forexes/add_forex', {
  				currencies: currencies
  			});
  		});
	},
	// Forex Add Form End

	// Forex Store Data Start
	store: function(req, res) {
	  	const currency = req.body.currency;
	  	const tt_selling_rates_clean_remittance_outwards = req.body.tt_selling_rates_clean_remittance_outwards;
	  	const bill_selling_rates_for_imports = req.body.bill_selling_rates_for_imports;
	  	const tt_buying_rates_clean_remittance_inwards = req.body.tt_buying_rates_clean_remittance_inwards;
	  	const bill_buying_rates_for_exports = req.body.bill_buying_rates_for_exports;
	  	const date = req.body.date;

	  	// create Request object
		var request = new sql.Request();

		var count = 1;
	  	currency.map(function(val, ind) {

	  		// query to the database and get the records
			request.query("INSERT INTO Forex_Rates (currency_name, tt_selling, tt_buying, upd_date, bill_selling, bill_buying, currency_display, curr_id) VALUES ('"+val+"', '"+tt_selling_rates_clean_remittance_outwards[ind]+"', '"+tt_buying_rates_clean_remittance_inwards[ind]+"', '"+date+"', '"+bill_selling_rates_for_imports[ind]+"', '"+bill_buying_rates_for_exports[ind]+"', 1, '"+count+"')", function (err) {
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }
		    request.query("SELECT @@IDENTITY AS id", function(error, recordset) {

		    	// console.log(recordset.recordset[0].id);
			    let new_forex = new Forex({
			      currency: val,
			      tt_selling_rates_clean_remittance_outwards: tt_selling_rates_clean_remittance_outwards[ind],
			      bill_selling_rates_for_imports: bill_selling_rates_for_imports[ind],
			      tt_buying_rates_clean_remittance_inwards: tt_buying_rates_clean_remittance_inwards[ind],
			      bill_buying_rates_for_exports: bill_buying_rates_for_exports[ind],
			      date: date,
			      // sql_id: ''
			      sql_id: recordset.recordset[0].id
			    });
		        new_forex.save(function(err) {
		          if(err) {
		            console.log(err);
		            // res.send('error|'+err);
		          }
		        });
	  		});
		  		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'forexes'
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
	        res.send('success|Record Inserted Successfully.');
	},
	// Forex Store Data End

	// Forex Edit Form Start
	edit: function(req, res) {
		Currency.find({}, function(err, currencies) {
			Forex.findOne({'sql_id': req.params.id}, function(err, forex) {
		    	if(forex) {
			      		res.render('forexes/edit_forex', {
			      		forex: forex,
			      		currencies: currencies
		    		});
		    	}
			});
		});
	},
	// Forex Edit Form End

	// Forex Update Data Start
	update: function(req, res) {
  		let query = {'sql_id': req.params.id}

  		// create Request object
		var request = new sql.Request();

		// query to the database and get the records
		request.query("UPDATE Forex_Rates SET currency_name = '"+req.body.currency+"', tt_selling = '"+req.body.tt_selling_rates_clean_remittance_outwards+"', tt_buying = '"+req.body.tt_buying_rates_clean_remittance_inwards+"', bill_selling = '"+req.body.bill_selling_rates_for_imports+"', bill_buying = '"+req.body.bill_buying_rates_for_exports+"' WHERE Id = "+req.params.id+"", function (err) {
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }

			Forex.findOne({'sql_id': req.params.id}, function(err, forex) {
	    		if(forex) {
			  		forex.currency = req.body.currency;
			        forex.tt_selling_rates_clean_remittance_outwards = req.body.tt_selling_rates_clean_remittance_outwards;
			        forex.bill_selling_rates_for_imports = req.body.bill_selling_rates_for_imports;
			        forex.tt_buying_rates_clean_remittance_inwards = req.body.tt_buying_rates_clean_remittance_inwards;
			        forex.bill_buying_rates_for_exports = req.body.bill_buying_rates_for_exports;
			        forex.date = req.body.date;
			  		forex.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'forexes'
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
	// Forex Update Data End

	// Forex Delete Data Start
	delete: function(req, res) {
  		let query = {'sql_id': req.params.id}

  		// create Request object
		var request = new sql.Request();

		// query to the database and get the records
		request.query("DELETE FROM Forex_Rates WHERE Id = "+req.params.id+"", function (err) {
		      
		    if (err) {
		    	console.log('Sql Error: '+err);
		    	return;
		    }

	  		Forex.findOne({'sql_id': req.params.id}, function(err, forex) {
	    		if(forex) {
		      		Forex.remove(query, function(err) {
		        		if(err) {
		          			console.log(err);
		          			res.send('error|'+err);
		        		} else {
		        			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Delete',
						        table: 'forexes'
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
	// Forex Delete Data End
}