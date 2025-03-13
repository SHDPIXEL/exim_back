const express = require('express');
const router = express.Router();

// Bring in Line Agents Model
let LineAgent = require('../models/lineAgent');
// Bring in Sector Model
let Sector = require('../models/sector');
// Bring in Port Model
let Port = require('../models/port');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Line Agents List Start
	list: function(req, res) {
  		res.render('line_agents/list_line_agent');
	},
	// Line Agents List End

	// Get Line Agents Data Start
	get_line_agents: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var sector_search = req.body.columns[1].search.value;
	    var terminal_search = req.body.columns[2].search.value;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};

	    if(sector_search) {
	    	sector_search = { $or: [{"sector_id": sector_search}]};
	    }
	    else {
	    	sector_search = {};
	    }
	    if(terminal_search) {
	    	terminal_search = { $or: [{"port_id": terminal_search}]};
	    }
	    else {
	    	terminal_search = {};
	    }

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"line": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "agent": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "carting_point": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   sector_search,
	      						   terminal_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    LineAgent.count({}, function(err, c) {
	        recordsTotal=c;
	        LineAgent.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                LineAgent.find(searchStr, '_id sector_id.name port_id.name line agent carting_point', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Line Agents Data End

	// Line Agent Add Form Start
	add: function(req, res) {
		Sector.find({"ref_id": {$ne: "8"}}, function(err, sectors) {
			Port.find({}, function(err, ports) {
				if(err) {
					console.log('error', err);
					return res.send('error|'+err);
				}	
	  			res.render('line_agents/add_line_agent', {
	  				sectors: sectors,
	  				ports: ports
	  			});
			});
		});
	},
	// Line Agent Add Form End

	// Line Agents Store Data Start
	store: function(req, res) {
		  	const sector_id = req.body.sector_id;
			if(sector_id == '5d0cc282685dd619acec11d4') {
			var sector_ref_id = '1';
    		} else if(sector_id == '5d0cc2ab685dd619acec11d5') {
    			sector_ref_id = '2';
    		} else if(sector_id == '5d0cc2bf685dd619acec11d6') {
    			sector_ref_id = '3';
    		} else if(sector_id == '5d0cc2cf685dd619acec11d7') {
    			sector_ref_id = '4';
    		} else if(sector_id == '5d0cc2eb685dd619acec11d8') {
    			sector_ref_id = '5';
    		} else if(sector_id == '5d0cc315685dd619acec11d9') {
    			sector_ref_id = '6';
    		} else if(sector_id == '5d0cc328685dd619acec11da') {
    			sector_ref_id = '7';
    		} else if(sector_id == '5d0cc331685dd619acec11db') {
    			sector_ref_id = '8';
    		}
		  	const port_id = req.body.port_id;
		  	if(port_id == '5d0cc5dbc5356a1ed83118fb') {
    			var port_ref_id = '1';
    		} else if(port_id == '5d0cc5e7c5356a1ed83118fc') {
    			port_ref_id = '2';
    		} else if(port_id == '5d0cc5f1c5356a1ed83118fd') {
    			port_ref_id = '3';
    		} else if(port_id == '5d0cc5fbc5356a1ed83118fe') {
    			port_ref_id = '4';
    		} else if(port_id == '5d5d17e3c3704811e52b66ef') {
    			port_ref_id = '5';
    		}
		  	const line = req.body.line;
		  	const agent = req.body.agent;
		  	const carting_point = req.body.carting_point;

		  		line.map(function(val, ind) {
				    let new_line_agent = new LineAgent({
				      sector_id: sector_id,
				      sector_ref_id: sector_ref_id,
				      port_id: port_id,
				      port_ref_id: port_ref_id,
				      line: line[ind],
				      agent: agent[ind],
				      carting_point: carting_point[ind]
				    });
			        new_line_agent.save(function(err) {
			          if(err) {
			            console.log(err);
			          }
			        });
		  		});
		  		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'line_agents'
	      		});

	        	new_log.save(function(err, user) {
	        		if(err) {
	          			console.log('err '+err);
	          			return res.send(err);
	        		}
	      		});
	        res.send('success|Record Inserted Successfully.');
	},
	// Line Agents Store Data End

	// Line Agent Edit Form Start
	edit: function(req, res) {
		Sector.find({}, function(err, sectors) {
			Port.find({}, function(err, ports) {
				LineAgent.findOne({'_id': req.params.id}, function(err, line_agent) {
			    	if(line_agent) {
			      		res.render('line_agents/edit_line_agent', {
			      			line_agent: line_agent,
			      			sectors: sectors,
			      			ports: ports
			    		});
			    	}
				});
			});
		});
	},
	// Line Agent Edit Form End

	// Line Agent Update Data Start
	update: function(req, res) {
  			let query = {_id: req.params.id}

			LineAgent.findOne(query, function(err, line_agent) {
	    		if(line_agent) {
	    			line_agent.sector_id = req.body.sector_id;
			        line_agent.port_id = req.body.port_id;
			        line_agent.line = req.body.line;
			        line_agent.agent = req.body.agent;
			        line_agent.carting_point = req.body.carting_point;
			  		line_agent.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'line_agents'
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
	// Line Agent Update Data End

	// Line Agent Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

	  		LineAgent.findOne(query, function(err, line_agent) {
	    		if(line_agent) {
	      		LineAgent.remove(query, function(err) {
	        		if(err) {
	          			console.log(err);
	          			res.send('error|'+err);
	        		} else {
	        			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete',
					        table: 'line_agents'
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
	// Line Agent Delete Data End
}