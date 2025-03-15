const express = require('express');

const router = express.Router();



const moment = require('moment');



const mailer = require("nodemailer");

 

// App User Model

let AppUser = require('../models/appUser');

// News Model

let News = require('../models/news');

// Customs Model

let Customs = require('../models/customs');

// Forex Model

let Forex = require('../models/forex');

// Digital Copy Model

let DigitalCopy = require('../models/digitalCopy');

// Year Book Model

let YearBook = require('../models/yearBook');

// Event Model

let Event = require('../models/event');

// Testimonial Model

let Testimonial = require('../models/testimonial');

// About Model

let About = require('../models/about');

// Contact Model

let Contact = require('../models/contact');

// Appointment Edition Model

let AppointmentEdition = require('../models/appointmentEdition');

// Appointment Job Title Model

let AppointmentJobTitle = require('../models/appointmentJobTitle');

// Appointment Model

let Appointment = require('../models/appointment');

// Sector Model

let Sector = require('../models/sector');

// Port Model

let Port = require('../models/port');

// Vessel Model

let Vessel = require('../models/vessel');



// Store Register Route Start
router.post('/register', function(req, res) {
  const {
    name,
    company_name,
    email,
    mobile,
    nature_business,
    subscribe_newsletter,
    contact_person,
    contact_person_designation,
    company_address,
    city,
    pincode,
    state,
    country,
    password,
    confirm_password
  } = req.body;

  // Validate required fields
  if (!name || !company_name || !email || !mobile || !nature_business || !subscribe_newsletter) {
    return res.status(400).json({ success: 0, message: "Required Fields Missing." });
  }

  let app_user = new AppUser({
    name,
    company_name,
    email,
    mobile,
    nature_business,
    subscribe_newsletter,
    contact_person: contact_person || "",
    contact_person_designation: contact_person_designation || "",
    company_address: company_address || "",
    city: city || "",
    pincode: pincode || "",
    state: state || "",
    country: country || "",
    password: password || "",
    confirm_password: confirm_password || ""
  });

  // Check if user already exists by email or mobile
  AppUser.findOne({ $or: [{ email }, { mobile }] }, function(err, existingUser) {
    if (err) {
      return res.status(500).json({ success: 0, message: "Something Went Wrong.", error: err });
    }

    if (existingUser) {
      // If user exists, update the record
      AppUser.findByIdAndUpdate(existingUser._id, req.body, { new: true }, function(err, updatedUser) {
        if (err) {
          return res.status(500).json({ success: 0, message: "Something Went Wrong.", error: err });
        }

        return res.status(200).json({
          success: 1,
          message: "Updated Successfully.",
          user_data: {
            id: updatedUser._id,
            name: updatedUser.name,
            company_name: updatedUser.company_name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            nature_business: updatedUser.nature_business,
            subscribe_newsletter: updatedUser.subscribe_newsletter,
            contact_person: updatedUser.contact_person,
            contact_person_designation: updatedUser.contact_person_designation,
            company_address: updatedUser.company_address,
            city: updatedUser.city,
            pincode: updatedUser.pincode,
            state: updatedUser.state,
            country: updatedUser.country,
            password: updatedUser.password,
            confirm_password: updatedUser.confirm_password
          }
        });
      });
    } else {
      // If new user, save to database
      app_user.save(function(err, savedUser) {
        if (err) {
          return res.status(500).json({ success: 0, message: "Something Went Wrong.", error: err });
        }

        return res.status(200).json({
          success: 1,
          message: "Registered Successfully.",
          user_data: {
            id: savedUser._id,
            name: savedUser.name,
            company_name: savedUser.company_name,
            email: savedUser.email,
            mobile: savedUser.mobile,
            nature_business: savedUser.nature_business,
            subscribe_newsletter: savedUser.subscribe_newsletter,
            contact_person: savedUser.contact_person,
            contact_person_designation: savedUser.contact_person_designation,
            company_address: savedUser.company_address,
            city: savedUser.city,
            pincode: savedUser.pincode,
            state: savedUser.state,
            country: savedUser.country,
            password: savedUser.password,
            confirm_password: savedUser.confirm_password
          }
        });
      });
    }
  });
});
// Store Register Route End



// Get Registered User Route Start

router.get('/register', function(req, res) {

  AppUser.find({}, function(err, appUsers) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.success = 0;

      return res.status(500).json(result);

    }

    if(appUsers) {

      return res.status(200).json(appUsers);

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

  });

});

// Get Registered User Route End



// Store News Route Start

router.post('/news', function(req, res) {

    

    let news = new News();

    news.category_id = req.body.category_id;

    news.date = req.body.date;

    news.headline = req.body.headline;

    news.link_url = req.body.link_url;

    news.description = req.body.description;

    news_data.four_lines = news.four_lines;

    news.image = req.body.image;



    news.save(function(err, news) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.news = {};

        result.news.id = news._id;

        result.news.category_id = news.category_id;

        result.news.date = news.date;

        result.news.headline = news.headline;

        result.news.link_url = news.link_url;

        result.news.description = news.description;

        news_data.four_lines = news.four_lines;

        result.news.image = news.image;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store News Route End



// Get News Route Start
router.get('/news/:category_id', function(req, res) {
  today_date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";
  if(req.params.category_id != -1) {
  News.find({$and: [{"date": today_date},{"category_id": req.params.category_id}]}, function(err, data) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
      let result = {};
      result.news_data = [];
      data.map(function(news) {
      let news_data = {};
        news_data.id = news._id;
        news_data.category_id = news.category_id;
        news_data.date = news.date;
        news_data.headline = news.headline;
        news_data.link_url = news.link_url;
        news_data.image = news.image;
        news_data.description = news.description;
        news_data.four_lines = news.four_lines;
        result.news_data.push(news_data);
      });

      result.success = 1;
      return res.status(200).json(result);
    }
    News.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data1 != '' && data1 !== null) {

    News.find({$and: [{"date": data1.date},{"category_id": req.params.category_id}]}, function(err, data2) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data2 != '' && data2 !== null) {

      let result = {};
      result.news_data = [];
      data2.map(function(news) {
      let news_data = {};
        news_data.id = news._id;
        news_data.category_id = news.category_id;
        news_data.date = news.date;
        news_data.headline = news.headline;
        news_data.image = news.image;
        news_data.link_url = news.link_url;
        news_data.description = news.description;
        news_data.four_lines = news.four_lines;
        result.news_data.push(news_data);
      });

      result.success = 1;

      return res.status(200).json(result);
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    });
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).sort({'date': -1});
  });
  } else {
  News.find({$and: [{"date": today_date}]}, function(err, data) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
      let result = {};
      result.news_data = [];
      data.map(function(news) {
      let news_data = {};
        news_data.id = news._id;
        news_data.category_id = news.category_id;
        news_data.date = news.date;
        news_data.headline = news.headline;
        news_data.link_url = news.link_url;
        news_data.image = news.image;
        news_data.description = news.description;
        news_data.four_lines = news.four_lines;
        result.news_data.push(news_data);
      });

      result.success = 1;
      return res.status(200).json(result);
    }
    News.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data1 != '' && data1 !== null) {

    News.find({$and: [{"date": data1.date}]}, function(err, data2) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data2 != '' && data2 !== null) {

      let result = {};
      result.news_data = [];
      data2.map(function(news) {
      let news_data = {};
        news_data.id = news._id;
        news_data.category_id = news.category_id;
        news_data.date = news.date;
        news_data.headline = news.headline;
        news_data.link_url = news.link_url;
        news_data.image = news.image;
        news_data.description = news.description;
        news_data.four_lines = news.four_lines;
        result.news_data.push(news_data);
      });

      result.success = 1;

      return res.status(200).json(result);
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    });
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).sort({'date': -1});
  });
  }
});
// Get News Route End



// Get News Archive Route Start

router.get('/news_archive/:date', function(req, res) {

  date = req.params.date + "T00:00:00.000Z";  

  News.find({"date": date}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.news_data = [];

      data.map(function(news) {

      if(news.category_id == 1) {

        var category_name = 'Shipping News';

      }

      else if(news.category_id == 2) {

        var category_name = 'Trade News';

      }

      else if(news.category_id == 3) {

        var category_name = 'Port News';

      }

      else if(news.category_id == 4) {

        var category_name = 'Transport News';

      }

      else if(news.category_id == 5) {

        var category_name = 'Indian Economy';

      }

      else if(news.category_id == 2) {

        var category_name = 'Special Report';

      }

      let news_data = {};

        news_data.id = news._id;

        news_data.category_id = news.category_id;

        news_data.category_name = category_name;

        news_data.date = news.date;

        news_data.headline = news.headline;

        news_data.link_url = news.link_url;

        news_data.description = news.description;

        news_data.four_lines = news.four_lines;

        news_data.image = news.image;

        result.news_data.push(news_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    }

    let result = {};

    result.message = "No Record Found.";

    result.success = 0;

    return res.status(201).json(result);

  });

});

// Get News Archive Route End

// Get Searched News Route Start
router.get('/search_news/:value', function(req, res) {
  News.find({ $or: [{ "headline": { "$regex": req.params.value, "$options": "i" } }]}, function(err, data) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
      let result = {};
      result.news_data = [];
      data.map(function(news) {
      let news_data = {};
        news_data.id = news._id;
        news_data.category_id = news.category_id;
        // news_data.category_name = category_name;
        news_data.date = news.date;
        news_data.headline = news.headline;
        news_data.link_url = news.link_url;
        news_data.description = news.description;
        news_data.four_lines = news.four_lines;
        news_data.image = news.image;
        result.news_data.push(news_data);
      });

      result.success = 1;
      return res.status(200).json(result);
    }
    let result = {};
    result.message = "No Record Found.";
    result.success = 0;
    return res.status(201).json(result);
  });
});
// Get Searched News Route End

// Store Customs Route Start

router.post('/customs', function(req, res) {

    

    let customs = new Customs();

    customs.currency = req.body.currency;

    customs.date = req.body.date;

    customs.import = req.body.import;

    customs.export = req.body.export;



    customs.save(function(err, customs) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.customs = {};

        result.customs.id = customs._id;

        result.customs.currency = customs.currency;

        result.customs.date = customs.date;

        result.customs.import = customs.import;

        result.customs.export = customs.export;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Customs Route End



// Get Customs Route Start

router.get('/customs/:date?', function(req, res) {

  if(typeof(req.params.date) == "undefined") {

    date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";

  } else {

    date = req.params.date + "T00:00:00.000Z";

  }

  Customs.find({"date": date}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.customs_data = [];

      data.map(function(customs) {

      let customs_data = {};

        customs_data.id = customs._id;

        customs_data.currency = customs.currency;

        customs_data.date = customs.date;

        customs_data.import = customs.import;

        customs_data.export = customs.export;

        result.customs_data.push(customs_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    }

    Customs.findOne({"date": {$lt:date}}, function(err, data1) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data1 != '' && data1 !== null) {



    Customs.find({"date": data1.date}, function(err, data2) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data2 != '' && data2 !== null) {



     let result = {};

      result.customs_data = [];

      data2.map(function(customs) {

      let customs_data = {};

        customs_data.id = customs._id;

        customs_data.currency = customs.currency;

        customs_data.date = customs.date;

        customs_data.import = customs.import;

        customs_data.export = customs.export;

        result.customs_data.push(customs_data);

      });



      result.success = 1;



      return res.status(200).json(result);

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    });

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).sort({'date': -1});

  });

});

// Get Customs Route End



// Store Forex Route Start

router.post('/forex', function(req, res) {

    

    let forex = new Forex();

    forex.currency = req.body.currency;

    forex.date = req.body.date;

    forex.tt_selling_rates_clean_remittance_outwards = req.body.tt_selling_rate_outwards;

    forex.bill_selling_rates_for_imports = req.body.bill_selling_rates_imports;

    forex.tt_buying_rates_clean_remittance_inwards = req.body.tt_buying_rate_inwards;

    forex.bill_buying_rates_for_exports = req.body.bill_buying_rates_exports;



    forex.save(function(err, forex) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.forex = {};

        result.forex.id = forex._id;

        result.forex.currency = forex.currency;

        result.forex.date = forex.date;

        result.forex.tt_selling_rate_outwards = forex.tt_selling_rates_clean_remittance_outwards;

        result.forex.bill_selling_rates_imports = forex.bill_selling_rates_for_imports;

        result.forex.tt_buying_rate_inwards = forex.tt_buying_rates_clean_remittance_inwards;

        result.forex.bill_buying_rates_exports = forex.bill_buying_rates_for_exports;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Customs Route End



// Get Customs Route Start

router.get('/forex/:date?', function(req, res) {

  if(typeof(req.params.date) == "undefined") {

    date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";

  } else {

    date = req.params.date + "T00:00:00.000Z";

  }

  Forex.find({"date": date}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.forex_data = [];

      data.map(function(forex) {

      let forex_data = {};

        forex_data.id = forex._id;

        forex_data.currency = forex.currency;

        forex_data.date = forex.date;

        forex_data.tt_selling_rate_outwards = forex.tt_selling_rates_clean_remittance_outwards;

        forex_data.bill_selling_rates_imports = forex.bill_selling_rates_for_imports;

        forex_data.tt_buying_rate_inwards = forex.tt_buying_rates_clean_remittance_inwards;

        forex_data.bill_buying_rates_exports = forex.bill_buying_rates_for_exports;

        result.forex_data.push(forex_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    }

    Forex.findOne({"date": {$lt:date}}, function(err, data1) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data1 != '' && data1 !== null) {



    Forex.find({"date": data1.date}, function(err, data2) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data2 != '' && data2 !== null) {



      let result = {};

      result.forex_data = [];

      data2.map(function(forex) {

      let forex_data = {};

        forex_data.id = forex._id;

        forex_data.currency = forex.currency;

        forex_data.date = forex.date;

        forex_data.tt_selling_rate_outwards = forex.tt_selling_rates_clean_remittance_outwards;

        forex_data.bill_selling_rates_imports = forex.bill_selling_rates_for_imports;

        forex_data.tt_buying_rate_inwards = forex.tt_buying_rates_clean_remittance_inwards;

        forex_data.bill_buying_rates_exports = forex.bill_buying_rates_for_exports;

        result.forex_data.push(forex_data);

      });



      result.success = 1;



      return res.status(200).json(result);

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    });

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).sort({'date': -1});

  });

});

// Get Customs Route End



// Store Digital Copy Route Start

router.post('/digital_copies', function(req, res) {

    

    let digital_copy = new DigitalCopy();

    digital_copy.name = req.body.name;

    digital_copy.url = req.body.url;

    digital_copy.image = req.body.image;

    digital_copy.status = req.body.status;



    digital_copy.save(function(err, digital_copy) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.digital_copy = {};

        result.digital_copy.id = digital_copy._id;

        result.digital_copy.name = digital_copy.name;

        result.digital_copy.url = digital_copy.url;

        result.digital_copy.image = digital_copy.image;

        result.digital_copy.status = digital_copy.status;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Digital Copy Route End



// Get Digital Copy Route Start

router.get('/digital_copies', function(req, res) {

  DigitalCopy.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.digital_copy_data = [];

      data.map(function(digital_copy) {

      let digital_copy_data = {};

        digital_copy_data.id = digital_copy._id;

        digital_copy_data.name = digital_copy.name;

        digital_copy_data.url = digital_copy.url;

        digital_copy_data.image = digital_copy.image;

        digital_copy_data.status = digital_copy.status;

        result.digital_copy_data.push(digital_copy_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Digital Copy Route End



// Store Year Book Route Start

router.post('/year_books', function(req, res) {

    

    let year_book = new YearBook();

    year_book.name = req.body.name;

    year_book.url = req.body.url;

    year_book.image = req.body.image;

    year_book.status = req.body.status;



    year_book.save(function(err, year_book) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.year_book = {};

        result.year_book.id = year_book._id;

        result.year_book.name = year_book.name;

        result.year_book.url = year_book.url;

        result.year_book.image = year_book.image;

        result.year_book.status = year_book.status;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Year Book Route End



// Get Year Book Route Start

router.get('/year_books', function(req, res) {

  YearBook.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.year_book_data = [];

      data.map(function(year_book) {

      let year_book_data = {};

        year_book_data.id = year_book._id;

        year_book_data.name = year_book.name;

        year_book_data.url = year_book.url;

        year_book_data.image = year_book.image;

        year_book_data.status = year_book.status;

        result.year_book_data.push(year_book_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Year Book Route End

// Get Digital Copy and Year Book Route Start
router.get('/digital_copies_year_books', function(req, res) {
  Promise.all([
  DigitalCopy.find({"status": 1}),
  YearBook.find({"status": 1})
  ])
  .then(results=>{

  const [digital_copies, year_books] = results;
      let result = {};
      result.digital_copy_data = [];
      digital_copies.map(function(digital_copy) {
      let digital_copy_data = {};
        digital_copy_data.id = digital_copy._id;
        digital_copy_data.name = digital_copy.name;
        digital_copy_data.url = digital_copy.url;
        digital_copy_data.image = digital_copy.image;
        digital_copy_data.status = digital_copy.status;
        result.digital_copy_data.push(digital_copy_data);
      });

      result.year_book_data = [];
      year_books.map(function(year_book) {
      let year_book_data = {};
        year_book_data.id = year_book._id;
        year_book_data.name = year_book.name;
        year_book_data.url = year_book.url;
        year_book_data.image = year_book.image;
        year_book_data.status = year_book.status;
        result.year_book_data.push(year_book_data);
      });

      result.success = 1;
      return res.status(200).json(result);

  })
  .catch(err=>{
  console.error("Something went wrong",err);
  });
});
// Get Digital Copy and Year Book Route End

// Store Event Route Start

router.post('/events', function(req, res) {

    

    let event = new Event();

    event.name = req.body.name;

    event.url = req.body.url;

    event.image = req.body.image;

    event.venue = req.body.venue;

    event.date = req.body.date;

    event.status = req.body.status;



    event.save(function(err, event) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.event = {};

        result.event.id = event._id;

        result.event.name = event.name;

        result.event.url = event.url;

        result.event.image = event.image;

        result.event.venue = event.venue;

        result.event.date = event.date;

        result.event.status = event.status;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Event Route End



// Get Event Route Start

router.get('/events/:status?', function(req, res) {

  if(typeof(req.params.status) == "undefined") {

    Event.find({}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.event_data = [];

      data.map(function(event) {

      let event_data = {};

        event_data.id = event._id;

        event_data.name = event.name;

        event_data.url = event.url;

        event_data.image = event.image;

        event_data.venue = event.venue;

        event_data.date = event.date;

        event_data.status = event.status;

        result.event_data.push(event_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

  } else {

   Event.find({"status": req.params.status}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.event_data = [];

      data.map(function(event) {

      let event_data = {};

        event_data.id = event._id;

        event_data.name = event.name;

        event_data.url = event.url;

        event_data.image = event.image;

        event_data.venue = event.venue;

        event_data.date = event.date;

        event_data.status = event.status;

        result.event_data.push(event_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  }); 

  }

});

// Get Event Route End



// Store Testimonial Route Start

router.post('/testimonials', function(req, res) {

    

    let testimonial = new Testimonial();

    testimonial.name = req.body.name;

    testimonial.company_designation = req.body.company_designation;

    testimonial.description = req.body.description;

    testimonial.status = req.body.status;



    testimonial.save(function(err, testimonial) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.success = 0;

        return res.status(201).json(result);

      }

        let result = {};

        result.testimonial = {};

        result.testimonial.id = testimonial._id;

        result.testimonial.name = testimonial.name;

        result.testimonial.company_designation = testimonial.company_designation;

        result.testimonial.description = testimonial.description;

        result.testimonial.status = testimonial.status;



        result.message = "Record Inserted Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

    });

});

// Store Testimonial Route End



// Get Testimonial Route Start

router.get('/testimonials', function(req, res) {

    Testimonial.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.testimonial_data = [];

      data.map(function(testimonial) {

      let testimonial_data = {};

        testimonial_data.id = testimonial._id;

        testimonial_data.name = testimonial.name;

        testimonial_data.company_designation = testimonial.company_designation;

        testimonial_data.description = testimonial.description;

        testimonial_data.status = testimonial.status;

        result.testimonial_data.push(testimonial_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Testimonial Route End



// Store About Route Start

router.post('/about', function(req, res) {

    let about = new About();

      about.description = req.body.description;

      about.networks = req.body.networks;

      about.readers = req.body.readers;

      req.body.editions.map(function(edition) {

      let edition_data = {};

      edition_data.name = edition.name;

      edition_data.image = edition.image;

      about.editions.push(edition_data)

      });

      about.save(function(err, about) {

        if(err) {

          let result = {};

          result.message = "Required Fields Missing.";

          result.error = err;

          result.success = 0;

          return res.status(201).json(result);

        }

        return res.status(201).json(about);

    });

});

// Store About Route End



// Get About Route Start

router.get('/about', function(req, res) {

    About.findOne({}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.about_data = {};

      let about_data = {};

        about_data.id = data._id;

        about_data.description = data.description;

        about_data.networks = data.networks;

        about_data.readers = data.readers;

        about_data.editions = data.editions;

        result.about_data = about_data;



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get About Route End



// Store Contact Route Start

router.post('/contact', function(req, res) {

    let contact = new Contact();

      contact.office = req.body.office;

      contact.type = req.body.type;

      contact.address = req.body.address;

      contact.telephone = req.body.telephone;

      contact.fax = req.body.fax;

      if(typeof(req.body.emails) !== 'undefined') {

      req.body.emails.map(function(email) {

      let email_data = {};

      email_data.email = email.email;

      contact.emails.push(email_data)

      });

    }

      contact.save(function(err, contact) {

        if(err) {

          let result = {};

          result.message = "Required Fields Missing.";

          result.error = err;

          result.success = 0;

          return res.status(201).json(result);

        }

        return res.status(201).json(contact);

    });

});

// Store Contact Route End



router.post('/send_mail', function(req, res) {



  // Use Smtp Protocol to send Email

  let smtpTransport = mailer.createTransport({

      host: 'mail.eximindiaonline.in',

      port: 587,

      secure: false,  //true for 465 port, false for other ports

      auth: {

        user: 'info@eximindiaonline.in',

        pass: 'Asia@2019'

      },

      tls: {

        rejectUnauthorized: false

      }

    });



  var mail = {

      from: "info@eximindiaonline.in",

      to: "info@eximindiaonline.in",

      subject: "Enquiry from Contact Us",

      html: `<b>Feedback Type </b>: ${req.body.type}<br><b>Name </b>: ${req.body.name}<br><b>Email </b>: ${req.body.email}<br><b>Mobile </b>: ${req.body.mobile}<br>`

  }



  smtpTransport.sendMail(mail, function(error, resp){

      if(error){

          let result = {};

          result.message = "Something Went Wrong.";

          result.error = error;

          result.success = 0;

          return res.status(201).json(result);

      }else{

        let result = {};

        result.message = "Mail Sent Succesfully.";

        result.success = 1;

        return res.status(200).json(result);

      }



      smtpTransport.close();

  });

});



// Get Contact Route Start

router.get('/head_office', function(req, res) {

    Contact.findOne({"type": "head_office"}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.head_office_data = {};

      let head_office_data = {};

        head_office_data.id = data._id;

        head_office_data.office = 'Mumbai';

        head_office_data.address = data.address;

        head_office_data.telephone = data.telephone;

        head_office_data.fax = data.fax;

        head_office_data.emails = data.emails;

        result.head_office_data = head_office_data;



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Contact Route End



// Get Contact Route Start

router.get('/branch_office/:id', function(req, res) {

    Contact.findOne({"office": req.params.id}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.branch_office_data = {};

      if(data.office == 1) {

        office = 'AGRA';

      } else if(data.office == 2) {

        office = 'AHMEDABAD';

      } else if(data.office == 3) {

        office = 'BANGALORE';

      } else if(data.office == 4) {

        office = 'BHADOHI';

      } else if(data.office == 5) {

        office = 'CHENNAI';

      } else if(data.office == 6) {

        office = 'GANDHIDHAM';

      } else if(data.office == 7) {

        office = 'JAIPUR';

      } else if(data.office == 8) {

        office = 'JAMNAGAR';

      } else if(data.office == 9) {

        office = 'JODHPUR';

      } else if(data.office == 10) {

        office = 'KANPUR';

      } else if(data.office == 11) {

        office = 'KOCHI';

      } else if(data.office == 12) {

        office = 'KOLKATA';

      } else if(data.office == 13) {

        office = 'LUDHIANA';

      } else if(data.office == 14) {

        office = 'MUMBAI';

      } else if(data.office == 15) {

        office = 'NEW DELHI';

      } else if(data.office == 16) {

        office = 'PUNE';

      } else if(data.office == 17) {

        office = 'TUTICORIN';

      } else if(data.office == 18) {

        office = 'VADODARA';

      } else if(data.office == 19) {

        office = 'VISAKHAPATNAM';

      }

      let branch_office_data = {};

        branch_office_data.id = data._id;

        branch_office_data.office = office;

        branch_office_data.address = data.address;

        branch_office_data.telephone = data.telephone;

        branch_office_data.fax = data.fax;

        branch_office_data.emails = data.emails;

        result.branch_office_data = branch_office_data;



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Contact Route End



// Store Appointment Edition Route Start

router.post('/editions', function(req, res) {

    let appointment_edition = new AppointmentEdition();

      appointment_edition.edition = req.body.edition;

      appointment_edition.status = req.body.status;

      appointment_edition.save(function(err, appointment_edition) {

        if(err) {

          let result = {};

          result.message = "Required Fields Missing.";

          result.error = err;

          result.success = 0;

          return res.status(201).json(result);

        }



        return res.status(201).json(appointment_edition);

    });

});

// Store Appointment Edition Route End



// Get Appointment Edition Route Start

router.get('/editions', function(req, res) {

    AppointmentEdition.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.edition_data = [];

      data.map(function(edition) {

      let edition_data = {};

      edition_data.id = edition._id;

      edition_data.edition = edition.edition;

      result.edition_data.push(edition_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Appointment Edition Route End



// Store Appointment Job Title Route Start

router.post('/job_title', function(req, res) {

    let appointment_job_title = new AppointmentJobTitle();

    appointment_job_title.job_title = req.body.job_title;

    appointment_job_title.status = req.body.status;

    appointment_job_title.save(function(err, appointment_job_title) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.error = err;

        result.success = 0;

        return res.status(201).json(result);

      }



      return res.status(201).json(appointment_job_title);

    });

});

// Store Appointment Job Title Route End



// Store Appointment Route Start

router.post('/appointments', function(req, res) {

    let appointment = new Appointment();

    appointment.edition_id = req.body.edition_id;

    appointment.job_title_id = req.body.job_title_id;

    appointment.date = req.body.date;

    appointment.description = req.body.description;

    appointment.status = req.body.status;

    appointment.save(function(err, appointment) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.error = err;

        result.success = 0;

        return res.status(201).json(result);

      }



      return res.status(201).json(appointment);

    });

});

// Store Appointment Route End



// Get Appointment Route Start

router.get('/appointments/:edition_id', function(req, res) {

    todays_date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";

    seventh_date = moment().subtract(7, 'd').format('YYYY-MM-DD') + "T00:00:00.000Z";

    Appointment.find({$and: [{"status": 1}, {"edition_id" : req.params.edition_id}, {"date": {$gte: seventh_date, $lte: todays_date}}]}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.appointment_data = [];

      data.map(function(appointment) {

      let appointment_data = {};

      appointment_data.id = appointment._id;

      appointment_data.job_title = appointment.job_title_id.job_title;

      appointment_data.date = appointment.date;

      // appointment_data.description = appointment.description;

      result.appointment_data.push(appointment_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  }).populate('job_title_id', 'job_title').sort({"date": -1});

});

// Get Appointment Route End



// Get Appointment Details Route Start

router.get('/appointment_details/:appointment_id', function(req, res) {

    Appointment.find({$and: [{"status": 1}, {"_id" : req.params.appointment_id}]}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.appointment_details_data = [];

      data.map(function(appointment_detail) {

      let appointment_details_data = {};

      appointment_details_data.id = appointment_detail._id;

      appointment_details_data.job_title = appointment_detail.job_title_id.job_title;

      appointment_details_data.date = appointment_detail.date;

      appointment_details_data.description = appointment_detail.description;

      result.appointment_details_data.push(appointment_details_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  }).populate('job_title_id', 'job_title').sort({"date": -1});

});

// Get Appointment Details Route End



// Show Contact Form Start

router.get('/contact', function(req, res) {

  res.render('contact');

});

// Show Contact Form End



// Store Contact from Form Start

router.post('/test', function(req, res) {



  let contact = new Contact();

      contact.office = req.body.office;

      contact.type = req.body.type;

      contact.address = req.body.address;

      contact.telephone = req.body.telephone;

      contact.fax = req.body.fax;

      if(typeof(req.body.emails) !== 'undefined') {

        req.body.emails.map(function(email) {

        let email_data = {};

        email_data.email = email;

        contact.emails.push(email_data)

        });

      }

      contact.save(function(err, contact) {

        if(err) {

          let result = {};

          result.message = "Required Fields Missing.";

          result.error = err;

          result.success = 0;

          return res.status(201).json(result);

        }

        return res.status(201).json(contact);

    });

});

// Store Contact from Form End



// Show About Form Start

router.get('/about2', function(req, res) {

  res.render('about');

});

// Show About Form End



// Store About from Form Start

router.post('/test2', function(req, res) {



  let about = new About();

      about.description = req.body.description;

      about.networks = req.body.networks;

      about.readers = req.body.readers;

      req.body.names.map(function(edition, i) {

      let edition_data = {};

      edition_data.name = edition;

      edition_data.image = req.body.images[i];

      about.editions.push(edition_data)

      });

      about.save(function(err, about) {

        if(err) {

          let result = {};

          result.message = "Required Fields Missing.";

          result.error = err;

          result.success = 0;

          return res.status(201).json(result);

        }

        return res.status(201).json(about);

    });

});

// Store About from Form End



// Store Sector Route Start

router.post('/sectors', function(req, res) {

    let sector = new Sector();

    sector.name = req.body.name;

    sector.status = req.body.status;

    sector.save(function(err, sector) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.error = err;

        result.success = 0;

        return res.status(201).json(result);

      }



      return res.status(201).json(sector);

    });

});

// Store Sector Route End



// Get Sector Route Start

router.get('/sectors', function(req, res) {

    Sector.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.sector_data = [];

      data.map(function(sector) {

      let sector_data = {};

        sector_data.id = sector._id;

        sector_data.name = sector.name;

        sector_data.status = sector.status;

      result.sector_data.push(sector_data);

      });

      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Sector Route End



// Store Port Route Start

router.post('/ports', function(req, res) {

    let port = new Port();

    port.name = req.body.name;

    port.status = req.body.status;

    port.save(function(err, port) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.error = err;

        result.success = 0;

        return res.status(201).json(result);

      }



      return res.status(201).json(port);

    });

});

// Store Port Route End



// Get Port Route Start

router.get('/ports', function(req, res) {

    Port.find({"status": 1}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.port_data = [];

      data.map(function(sector) {

      let port_data = {};

        port_data.id = sector._id;

        port_data.name = sector.name;

        port_data.status = sector.status;

      result.port_data.push(port_data);

      });

      result.success = 1;

      return res.status(200).json(result);

    } else {

      let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(500).json(result);

    }

  });

});

// Get Port Route End



// Store Vessel Route Start

router.post('/vessels', function(req, res) {

    let vessel = new Vessel();

    vessel.sector_id = req.body.sector_id;

    vessel.port_id = req.body.port_id;

    vessel.sector_ref_id = req.body.sector_ref_id;

    vessel.port_ref_id = req.body.port_ref_id;

    vessel.date = req.body.date;

    vessel.eta = req.body.eta;

    vessel.etd = req.body.etd;

    vessel.cy_cut_off_date_time = req.body.cy_cut_off_date_time;

    vessel.vessel_name_via_no = req.body.vessel_name_via_no;

    vessel.voy_no = req.body.voy_no;

    vessel.rot_no_date = req.body.rot_no_date;

    vessel.line = req.body.line;

    vessel.agent = req.body.agent;

    vessel.carting_point = req.body.carting_point;

    vessel.save(function(err, port) {

      if(err) {

        let result = {};

        result.message = "Required Fields Missing.";

        result.error = err;

        result.success = 0;

        return res.status(201).json(result);

      }



      return res.status(201).json(vessel);

    });

});

// Store Vessel Route End



// Get Vessel Route Start

router.get('/vessels/:sector_id/:port_id', function(req, res) {

  today_date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";



  if(req.params.port_id != -1) {

  Vessel.find({$and: [{"date": today_date}, {"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

      let result = {};

      result.vessels_data = [];

      data.map(function(vessels) {

      let vessels_data = {};

        vessels_data.id = vessels._id;

        vessels_data.sector_name = vessels.sector_id.name;

        vessels_data.port_name = vessels.port_id.name;

        vessels_data.date = vessels.date;

        vessels_data.eta = vessels.eta;

        vessels_data.etd = vessels.etd;

        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;

        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;

        vessels_data.voy_no = vessels.voy_no;

        vessels_data.rot_no_date = vessels.rot_no_date;

        vessels_data.line = vessels.line;

        vessels_data.agent = vessels.agent;

        vessels_data.carting_point = vessels.carting_point;

        result.vessels_data.push(vessels_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    }

    Vessel.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data1 != '' && data1 !== null) {



    Vessel.find({$and: [{"date": data1.date}, {"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, data2) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data2 != '' && data2 !== null) {

       let result = {};

      result.vessels_data = [];

      data2.map(function(vessels) {

      let vessels_data = {};

        vessels_data.id = vessels._id;

        vessels_data.sector_name = vessels.sector_id.name;

        vessels_data.port_name = vessels.port_id.name;

        vessels_data.date = vessels.date;

        vessels_data.eta = vessels.eta;

        vessels_data.etd = vessels.etd;

        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;

        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;

        vessels_data.voy_no = vessels.voy_no;

        vessels_data.rot_no_date = vessels.rot_no_date;

        vessels_data.line = vessels.line;

        vessels_data.agent = vessels.agent;

        vessels_data.carting_point = vessels.carting_point;

        result.vessels_data.push(vessels_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).populate('sector_id', 'name').populate('port_id', 'name');

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).sort({'date': -1});

  }).populate('sector_id', 'name').populate('port_id', 'name');

  } else {

  Vessel.find({$and: [{"date": today_date}, {"sector_id": req.params.sector_id}]}, function(err, data) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data != '' && data !== null) {

       let result = {};

      result.vessels_data = [];

      data.map(function(vessels) {

      let vessels_data = {};

        vessels_data.id = vessels._id;

        vessels_data.sector_name = vessels.sector_id.name;

        vessels_data.port_name = vessels.port_id.name;

        vessels_data.date = vessels.date;

        vessels_data.eta = vessels.eta;

        vessels_data.etd = vessels.etd;

        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;

        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;

        vessels_data.voy_no = vessels.voy_no;

        vessels_data.rot_no_date = vessels.rot_no_date;

        vessels_data.line = vessels.line;

        vessels_data.agent = vessels.agent;

        vessels_data.carting_point = vessels.carting_point;

        result.vessels_data.push(vessels_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    }

    Vessel.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data1 != '' && data1 !== null) {



    Vessel.find({$and: [{"date": data1.date}, {"sector_id": req.params.sector_id}]}, function(err, data2) {

    if(err) {

      let result = {};

      result.message = "Something Went Wrong.";

      result.error = err;

      result.success = 0;

      return res.status(500).json(result);

    }

    if(data2 != '' && data2 !== null) {

       let result = {};

      result.vessels_data = [];

      data2.map(function(vessels) {

      let vessels_data = {};

        vessels_data.id = vessels._id;

        vessels_data.sector_name = vessels.sector_id.name;

        vessels_data.port_name = vessels.port_id.name;

        vessels_data.date = vessels.date;

        vessels_data.eta = vessels.eta;

        vessels_data.etd = vessels.etd;

        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;

        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;

        vessels_data.voy_no = vessels.voy_no;

        vessels_data.rot_no_date = vessels.rot_no_date;

        vessels_data.line = vessels.line;

        vessels_data.agent = vessels.agent;

        vessels_data.carting_point = vessels.carting_point;

        result.vessels_data.push(vessels_data);

      });



      result.success = 1;

      return res.status(200).json(result);

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).populate('sector_id', 'name').populate('port_id', 'name');

    } else {

       let result = {};

      result.message = "No Record Found.";

      result.success = 0;

      return res.status(201).json(result);

    }

    }).sort({'date': -1});

  }).populate('sector_id', 'name').populate('port_id', 'name');

  }

});

// Get Vessel Route End



module.exports = router;

