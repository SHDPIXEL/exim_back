const express = require('express');
const router = express.Router();

// Bring in Gazette Line Agents Model
let GazetteLineAgent = require('../models/gazetteLineAgent');
// Bring in Sector Model
let Sector = require('../models/sector');
// Bring in Port Model
let Port = require('../models/port');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Gazette Line Agents List Start
	list: function(req, res) {
  		res.render('gazette_line_agents/list_gazette_line_agent');
	},
	// Gazette Line Agents List End

	// Get Gazette Line Agents Data Start
	get_gazette_line_agents: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    var gazette_sector_search = req.body.columns[1].search.value;
	    var terminal_search = req.body.columns[2].search.value;
	    var service_search = req.body.columns[3].search.value;
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

	    if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"line": { "$regex": req.body.search.value, "$options": "i" }},
	      						   	   { "agent": { "$regex": req.body.search.value, "$options": "i" }},
	      						   	   { "service_id": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }
	      	var searchStr = { $and: [
	      						   common_search,
	      						   gazette_sector_search,
	      						   service_search,
	      						   terminal_search
	      						] };
	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    GazetteLineAgent.count({}, function(err, c) {
	        recordsTotal=c;
	        GazetteLineAgent.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                GazetteLineAgent.find(searchStr, '_id gazette_sector_id port_id.name service_id line agent', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Gazette Line Agents Data End

	// Gazette Line Agent Add Form Start
	add: function(req, res) {
		Sector.findOne({"ref_id": "9"}, function(err, sector) {
			Port.find({}, function(err, ports) {
				if(err) {
					console.log('error', err);
					return res.send('error|'+err);
				}	
	  			res.render('gazette_line_agents/add_gazette_line_agent', {
	  				sector: sector,
	  				ports: ports
	  			});
			});
		});
	},
	// Gazette Line Agent Add Form End

	// Gazette Line Agents Store Data Start
	store: function(req, res) {
		  	const sector_id = req.body.sector_id;
		  	const gazette_sector_id = req.body.gazette_sector_id;
		  	const port_id = req.body.port_id;
		  	const service_id = req.body.service_id;
		  	const line = req.body.line;
		  	const agent = req.body.agent;
		  	// console.log(req.body);return false;
		  		line.map(function(val, ind) {
				    let new_gazette_line_agent = new GazetteLineAgent({
				      sector_id: sector_id,
				      gazette_sector_id: gazette_sector_id,
				      port_id: port_id,
				      service_id: service_id,
				      line: line[ind],
				      agent: agent[ind]
				    });
			        new_gazette_line_agent.save(function(err) {
			          if(err) {
			            console.log(err);
			          }
			        });
		  		});
		  		let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'gazette_line_agents'
	      		});

	        	new_log.save(function(err, user) {
	        		if(err) {
	          			console.log('err '+err);
	          			return res.send(err);
	        		}
	      		});
	        res.send('success|Record Inserted Successfully.');
	},
	// Gazette Line Agents Store Data End

	// Gazette Line Agent Edit Form Start
	edit: function(req, res) {
			Port.find({}, function(err, ports) {
				GazetteLineAgent.findOne({'_id': req.params.id}, function(err, gazette_line_agent) {
			    	if(gazette_line_agent) {
			      		res.render('gazette_line_agents/edit_gazette_line_agent', {
			      			gazette_line_agent: gazette_line_agent,
			      			ports: ports
			    		});
			    	}
				});
			});
	},
	// Gazette Line Agent Edit Form End

	// Gazette Line Agent Update Data Start
	update: function(req, res) {
  			let query = {_id: req.params.id}

			GazetteLineAgent.findOne(query, function(err, gazette_line_agent) {
	    		if(gazette_line_agent) {
	    			// gazette_line_agent.sector_id = req.body.sector_id;
			        gazette_line_agent.gazette_sector_id = req.body.gazette_sector_id;
			        gazette_line_agent.port_id = req.body.port_id;
			        gazette_line_agent.service_id = req.body.service_id;
			        gazette_line_agent.line = req.body.line;
			        gazette_line_agent.agent = req.body.agent;
			  		gazette_line_agent.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'gazette_line_agents'
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
	// Gazette Line Agent Update Data End

	// Gazette Line Agent Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}

	  		GazetteLineAgent.findOne(query, function(err, gazette_line_agent) {
	    		if(gazette_line_agent) {
	      		GazetteLineAgent.remove(query, function(err) {
	        		if(err) {
	          			console.log(err);
	          			res.send('error|'+err);
	        		} else {
	        			let new_log = new Log({
					        user_id: req.user._id,
					        message: 'Delete',
					        table: 'gazette_line_agents'
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
	// Gazette Line Agent Delete Data End
}