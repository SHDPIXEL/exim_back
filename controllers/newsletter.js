const express = require("express");
const router = express.Router();
const moment = require("moment");
const mongoose = require("mongoose");

// Bring in News Model
let News = require("../models/news");
// Bring in Log Model
let Log = require("../models/log");

const generateHTML = async function (newsData, date) {
  let html = `<div align='center'>
    <table width='600' border='0' cellspacing='0' cellpadding='0'>
    <tr><td colspan='2' align='center' valign='top'>
    <p style='font-size: 13px;'>Can't View Newsletter? <a href='#' target='_blank'>Click Here!</a></p>
    </td></tr>
    <tr><td colspan='2' bgcolor='#eee' align='center'>
    <img src='https://eximin.net/DataFiles/cmsnewsletters/images/exim-header.png' width='600' alt='Exim' /></td></tr>
    <tr><td colspan='2' bgcolor='#2957a4' align='center'>
    <h2 style='color: #fff; font-size: 13px;'>India's Leading Maritime & Logistics Publication</h2></td></tr>
    <td colspan='2' style='line-height: 0px;'>
    <a href='https://register.eximin.net/Visitor/VisitorRegistration.aspx' target='_blank'><img src='https://eximin.net/DataFiles/cmsadvertisements/bwof6926.jpg' + width='600' height='100' alt='Exim' /></a>
    </td>
    <tr><td width='425px' bgcolor='#eee' valign='top'>
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
    </tr>
    <tr><td colspan='2' bgcolor='#eee' align='center'>
    <p style='font-size: 13px;padding:10px;'><strong>${date}</strong></p></td></tr>
`;

  for (const category of newsData) {
    if (category.news.length > 0) {
      html += `<tr><td bgcolor='#2957a4'>
          <p style='color: #fff; font-size: 13px; font-weight: bold;'><img src='https://eximin.net/DataFiles/cmsnewsletters/images/news-head.png' alt='' width='14' /> ${category.name}</p>
          </td></tr>`;

      category.news.forEach((news) => {
        html += `<tr><td style='padding: 8px 7px; border-bottom: 3px solid #ddd;'>
              <p style='font-size: 13px;'><a style='color: #000;text-decoration: none;' href='https://exim.demo.shdpixel.com/newsDetails/${news._id}' target='_blank'>
              ${news.headline}</a></p></td></tr>`;
      });
    }
  }

  html += `</table></td>
    <td width='175px' valign='top'>
    <table border='0' cellspacing='0' cellpadding='0'><tr><td style='border:2px solid #ddd;' align='center' valign='top'><a style='color: #000; text-decoration: none;' href='https://ctl.net.in/ctl-bhp-2025-default.aspx' target='_blank'>
    <img src ='https://eximin.net/DataFiles/cmsevents/wc22016CTL-BHP25_exim.jpg'  width='210' alt='' />
    </a></td>
    </tr>
    </table></td>
    </tr>
    <tr><td colspan='2'><table border='0' cellspacing='0' cellpadding='0'><tr><td style='padding: 8px 7px; background-color: #111; font-size: 12px;' align='center' width='200'><a style='color: #fff; text-decoration: none;' href='https://eximin.net/EnewsSubscribe.aspx' target='_blank'>SUBSCRIBE FOR<br/>E-NEWS</a></td><td style='padding: 8px 7px; background-color: #111; font-size: 12px;' align='center' width='200'><a style='color: #fff; text-decoration: none;' href='https://eximin.net/DcopyNewUser.aspx' target='_blank'>SUBSCRIBE FOR<br />DIGITAL COPY</a></td><td style='padding: 8px 7px; background-color: #111; font-size: 12px;' align='center' width='200'><a style='color: #fff; text-decoration: none;' href='https://eximin.net/EximHardCopySubscription.aspx' target='_blank'>SUBSCRIBE FOR<br />PRINT COPY</a></td></tr></table></td></tr><tr>
    <td colspan='2' style='line-height:0px;'>
    <img src='https://eximin.net/DataFiles/cmsnewsletters/images/eximin.jpg' width='600' height='200' alt='Exim' />
    </td>
    </tr>
    <tr><td colspan='2' style='color: #fff; padding: 8px 7px;' bgcolor='#2957a4' align='center'><p style='font-size: 13px; line-height:18px; padding:0px; margin:0px;'><a href='http://www.facebook.com/pages/Exim-India/132749816804720' target='blank'><img src='https://eximin.net/DataFiles/cmsnewsletters/images/facebook.png' width='25' height='25' alt='Facebook' border='0' /></a>&nbsp;<a href='https://twitter.com/Exim_India' target='blank'><img src='https://eximin.net/DataFiles/cmsnewsletters/images/twitter.png' width='25' height='25' alt='Twitter' border='0' /></a><br /><br />Address: Kailashpati Bldg, Plot No .10, Block 'A', 1st Floor, Veera Desai Road Extension, Behind Balaji Telefilms Ltd, Andheri(West), Mumbai - 400 053.<br /><br />Contact No.: <a style='color:#fff' href='tel:+912267571400'>+91 22 67571400</a>, Email: <a style='color:#fff' href='mailto:infomumbai@exim-india.com'>infomumbai@exim-india.com</a><br /><br />&copy; Exim India</p></td></tr><tr>
    <td colspan='2'  style='padding: 8px 7px;'>
    <p style='font-size: 13px; line-height:18px; padding:0px; margin:0px;'><strong>Disclaimer:</strong> This email has been sent to you by Exim India (for more information visit www.eximin.net). This email is intended solely for the addressee and the information it contains is confidential. If you are not the intended recipient, please inform us as soon as possible. Write your queries to  <a style='color:#000;' href='mailto:admin@exim-india.com'>admin@exim-india.com</a>.
    <br/><br/>
    <strong>To ensure that Exim India Newsletter find your inbox, please whitelist <a style='color:#000;' href='mailto:news@eximin.net'>news@eximin.net</a> in your email account.</strong>
    <br/><br/>
     <strong>Exim India Publication Group</strong>
    </p></td>
    </tr>
    </table></div>`;
  return html;
};

module.exports = {
  fetchNewsByCategory: async function (date) {
    const categories = [
      { id: "1", name: "Shipping News" },
      { id: "2", name: "Trade News" },
      { id: "3", name: "Port News" },
      { id: "4", name: "Transport News" },
      { id: "5", name: "Indian Economy" },
      { id: "6", name: "Special Report" },
    ];

    try {
      // Fetch the latest news for all categories (ignoring date filter)
      const allNews = await News.find().sort({ createdAt: -1 });

      console.log("📢 All News Fetched:");
      allNews.forEach((news) => {
        console.log(
          `News ID: ${news._id}, Category ID: '${
            news.category_id
          }' (${typeof news.category_id})`
        );
      });

      // Map news to respective categories with different limits
      const newsData = categories.map((category) => {
        // Convert category id to a number for checking odd/even
        const catIdNum = parseInt(category.id, 10);
        // Odd category ids get latest 4 news, even category ids get latest 2 news
        const limit = catIdNum % 2 !== 0 ? 4 : 2;

        const filteredNews = allNews
          .filter((news) => {
            if (!news.category_id) {
              console.warn(
                `⚠️ Skipping News ID ${news._id} - Missing category_id`
              );
              return false;
            }
            return (
              news.category_id.toString().trim() === category.id.toString()
            );
          })
          .slice(0, limit); // Use dynamic limit

        console.log(
          `📌 Category: ${category.name}, News Count: ${filteredNews.length} (Limit: ${limit})`
        );

        return { name: category.name, news: filteredNews };
      });

      console.log("✅ Filtered News Data:", newsData);

      // Format the date to 'Monday, 03 March 2025'
      const formattedDate = moment(date, "YYYY-MM-DD").format(
        "dddd, DD MMMM YYYY"
      );

      return generateHTML(newsData, formattedDate); // Pass formatted date
    } catch (error) {
      console.error("❌ Error fetching news:", error);
      return "<p>Error generating news HTML</p>";
    }
  },
  // Newsletters List Start
  /*list: function(req, res) {
  		// res.render('user/list_user');
	},*/
  // Newsletters List End

  // Get Newsletters Data Start
  /*get_users: function(req, res) {
	    var col = req.body.columns[req.body.order[0].column].data;
	    var order = req.body.order[0].dir;
	    if(order == 'asc') {
	        order = 1;
	    } else {
	        order = -1;
	    }
	    column_order = {[col]: order};
	    var searchStr = req.body.search.value;
	    if(req.body.search.value)
	    {       
	      searchStr = { $or: [{ "name": { "$regex": req.body.search.value, "$options": "i" } }, { "email": { "$regex": req.body.search.value, "$options": "i" } }, { "role": { "$regex": req.body.search.value, "$options": "i" } }, { "status": { "$regex": req.body.search.value, "$options": "i" } }] };
	    }
	    else
	    {
	      searchStr={};
	    }

	    var recordsTotal = 0;
	    var recordsFiltered=0;
	    
	    User.count({}, function(err, c) {
	        recordsTotal=c;
	        User.count(searchStr, function(err, c) {
	            recordsFiltered=c;
	                User.find(searchStr, '_id name role email status', {'skip': Number( req.body.start), 'limit': (req.body.length != -1) ? Number(req.body.length) : c }, function (err, results) { //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
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
	},*/
  // Get Newsletters Data End

  // Newsletter Add Form Start
  newsletter: function (req, res) {
    res.render("newsletter");
  },
  // Newsletter Add Form End

  // Newsletter Preview Data Start
  newsletter_preview: function (req, res) {
    // console.log(new Date(req.query.date));return false;
    News.aggregate(
      [
        {
          $match: { date: new Date(req.query.date) },
        },
        {
          $group: { _id: { category_id: "$category_id", date: "$date" } },
        },
        {
          $sort: { "_id.category_id": 1 },
        },
      ],
      function (err, category_id) {
        if (err) {
          console.log(err);
          return;
        }

        News.find(
          {
            $and: [
              { date: new Date(req.query.date) },
              { category_id: { $nin: ["7", "8"] } },
            ],
          },
          function (err, news) {
            if (err) {
              console.log("error " + err);
              res.send("error|" + err);
            }
            // console.log(news);return false;
            res.render("newsletter_preview", {
              category_id: category_id,
              news: news,
              date: req.query.date,
            });
          }
        ).select("category_id headline sql_id");
      }
    );
    /*let new_log = new Log({
	        	user_id: req.user._id,
	        	message: 'Newsletter Preview',
	        	table: 'news'
	      	});

	      	new_log.save(function(err, user) {
	        	if(err) {
	          		console.log('err '+err);
	          		return res.send(err);
	        	}
	      	});*/
  },
  // Newsletter Preview Data End

  // Newsletter Edit Form Start
  /*edit: function(req, res) {
		User.findById(req.params.id, function(err, user) {
		    if(user) {
		      	res.render('user/edit_user', {
		      	userr: user
		    	});
		    }
		});
	},*/
  // Newsletter Edit Form End

  // Newsletter Update Data Start
  /*update: function(req, res) {
  		let query = {_id: req.params.id}
  		User.findOne({ $and: [{'email': req.body.email}, {'_id': { $ne: req.params.id}}]}, function(err, user) {
	  		if(err) {
	  			console.log('finone '+err);
	            res.send('error|'+err);
	  		}
	  		if(user) {
	  			res.send('error|Email Already Exist.');
	  		} else {
			    User.findOne({'_id': req.params.id}, function(err, userr) {
			  		userr.name = req.body.name;
			  		userr.role = req.body.role;
			  		userr.email = req.body.email;
			  		userr.password = req.body.password;
			  		userr.status = req.body.status;
    				userr.save(function(err) {
			    		if(err) {
			      			console.log(err);
			      			res.send('error|'+err);
			    		} else {
			      			res.send('success|Record Updated Successfully.');
			    		}
		  			});
			    });
	  		}
	  	});
	},*/
  // Newsletter Update Data End

  // Newsletter Delete Data Start
  /*delete: function(req, res) {
  		let query = {_id: req.params.id}
  		// console.log(req.params.id);
  		User.findById(req.params.id, function(err, user) {
    		if(user) {
      		// console.log(query);
      		User.remove(query, function(err) {
        		if(err) {
          			console.log(err);
          			res.send('error|'+err);
        		} else {
          			res.send('success|Record Deleted Successfully.');
        		}
      		});
    		}
  		});
	},*/
  // Newsletter Delete Data End

  // Newsletter Login Form Start
  /*login: function(req, res) {
  		req.flash('msg', '');
  		res.render('login');
	},*/
  // Newsletter Login Form End

  // Newsletter Logout Start
  /*logout: function(req, res) {
		let new_log = new Log({
	        user_id: req.user._id,
	        message: 'Logout',
	        table: 'users'
	     });

	    new_log.save(function(err, user) {
	        if(err) {
	          console.log('err '+err);
	          return res.send(err);
	        }
	    });
  		req.logout();
  		res.redirect('/');
	},*/
  // Newsletter Logout End

  // Fetch Newsletters Data Start
  /*fetch_users: function(req, res) {
  		User.find({}, function(err, users) {
  			if(err) {
  				console.log('err '+err);
  				return res.send(err);
  			}
  			res.send(users);
  		});
	},*/
  // Fetch Newsletters Data End
};
