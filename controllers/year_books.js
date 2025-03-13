const express = require('express');
const router = express.Router();
const fs = require('fs');

// Bring in Year Book Model
let YearBook = require('../models/yearBook');
// Bring in Log Model
let Log = require('../models/log');

module.exports = {
	// Year Books List Start
	list: function(req, res) {
  		res.render('year_books/list_year_book');
	},
	// Year Books List End

	// Get Year Books Data Start
	get_year_books: function(req, res) {
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
	    
	    YearBook.count({}, function(err, c) {
	        recordsTotal=c;
	        YearBook.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                YearBook.find(searchStr, '_id name url image status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	// Get Year Books Data End

	// Year Book Add Form Start
	add: function(req, res) {
  		res.render('year_books/add_year_book');
	},
	// Year Book Add Form End

	// Year Book Store Data Start
	store: function(req, res) {
	  	const name = req.body.name;
	  	const url = req.body.url;
	  	const status = req.body.status;
    	const image = (req.file !== undefined) ? 'http://eximindiaonline.in:3000/uploads/year_books/'+req.file.filename : '';

		    let new_year_book = new YearBook({
		      name: name,
		      url: url,
		      status: status,
		      image: image
		    });

	        new_year_book.save(function(err) {
	          if(err) {
	            console.log(err);
	            res.send('error|'+err);
	          } else {
	          	let new_log = new Log({
			        user_id: req.user._id,
			        message: 'Add',
			        table: 'year_books'
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
	// Year Book Store Data End

	// Year Book Edit Form Start
	edit: function(req, res) {
		YearBook.findById(req.params.id, function(err, year_book) {
		    if(year_book) {
		      	res.render('year_books/edit_year_book', {
		      	year_book: year_book
		    	});
		    }
		});
	},
	// Year Book Edit Form End

	// Year Book Update Data Start
	update: function(req, res) {
  		let query = {_id: req.params.id}

    		YearBook.findById(req.params.id, function(err, year_book) {
	    		if(year_book) {
			  		year_book.name = req.body.name;
			        year_book.url = req.body.url;
			        year_book.status = req.body.status;
			        if(req.file !== undefined) {
		    			if(year_book.image !== '') {
		    				var image = year_book.image.split('/');
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
	    				year_book.image = 'http://eximindiaonline.in:3000/uploads/year_books/'+req.file.filename;
			    	}

			        // console.log(year_books);return false;
			  		year_book.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			    			let new_log = new Log({
						        user_id: req.user._id,
						        message: 'Edit',
						        table: 'year_books'
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
	// Year Book Update Data End

	// Year Book Delete Data Start
	delete: function(req, res) {
  		let query = {_id: req.params.id}
  		YearBook.findById(req.params.id, function(err, year_book) {
    		if(year_book) {
    			if(year_book.image != '') {
    				var image = year_book.image.split('/');
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
      		YearBook.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
        			let new_log = new Log({
				        user_id: req.user._id,
				        message: 'Delete',
				        table: 'year_books'
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
	// Year Book Delete Data End
}