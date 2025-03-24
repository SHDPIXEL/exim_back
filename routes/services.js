const express = require('express');
const router = express.Router();

/*const moment = require('moment');

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
let Vessel = require('../models/vessel');*/

// Services Controller
let services = require('../controllers/services');

// Store Register Route Start
router.post('/register', services.register);
// Store Register Route End

router.post('/login', services.login);

router.post("/order", services.orders);
router.post("/order-success", services.orderSuccess);
router.post("/change_password", services.changePassword);
router.post("/get_payments", services.get_payments);
router.post("/get_userSubscription", services.getUserSubscribe);
router.post("/get_dashboardSubscription", services.getUserSubscribe_dashboard);
// ✅ Route for requesting a password reset
router.post("/forgot-password", services.forgotPassword);

// ✅ Route for resetting the password
router.post("/reset-password/:token", services.resetPassword);

// Get Registered User Route Start
/*router.get('/register', function(req, res) {
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
});*/
// Get Registered User Route End

// Store News Route Start
/*router.post('/news', function(req, res) {
    
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
});*/
// Store News Route End

// Get News Route Start
router.get('/news/:category_id', services.news);
// Get News Route End

// Get News Archive Route Start
router.get('/news_archive/:date', services.news_archive);
// Get News Archive Route End

// Get Searched News Route Start
router.get('/search_news/:value', services.search_news);
// Get Searched News Route End

// Store Customs Route Start
/*router.post('/customs', function(req, res) {
    
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
});*/
// Store Customs Route End

// Get Customs Route Start
router.get('/customs/:date?', services.customs);
// Get Customs Route End

// Store Forex Route Start
/*router.post('/forex', function(req, res) {
    
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
});*/
// Store Customs Route End

// Get Customs Route Start
router.get('/forex/:date?', services.forex);
// Get Customs Route End

// Store Digital Copy Route Start
/*router.post('/digital_copies', function(req, res) {
    
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
});*/
// Store Digital Copy Route End

// Get Digital Copy Route Start
router.get('/digital_copies', services.digital_copies);
// Get Digital Copy Route End

// Store Year Book Route Start
/*router.post('/year_books', function(req, res) {
    
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
});*/
// Store Year Book Route End

// Get Year Book Route Start
router.get('/year_books', services.year_books);
// Get Year Book Route End

// Get Digital Copy and Year Book Route Start
router.get('/digital_copies_year_books', services.digital_copies_year_books);
// Get Digital Copy and Year Book Route End

// Store Event Route Start
/*router.post('/events', function(req, res) {
    
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
});*/
// Store Event Route End

// Get Event Route Start
router.get('/events/:status?/:category_id?', services.events);
// Get Event Route End

// Store Testimonial Route Start
/*router.post('/testimonials', function(req, res) {
    
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
});*/
// Store Testimonial Route End

// Get Testimonial Route Start
router.get('/testimonials', services.testimonials);
// Get Testimonial Route End

// Store About Route Start
/*router.post('/about', function(req, res) {
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
});*/
// Store About Route End

// Get About Route Start
router.get('/about', services.about);
// Get About Route End

// Store Contact Route Start
/*router.post('/contact', function(req, res) {
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
});*/
// Store Contact Route End

// Store Feedback Form Start
router.post('/send_mail', services.send_mail);
// Store Feedback Form End

// Get Contact Route Start
router.get('/head_office', services.head_office);
// Get Contact Route End

// Get Contact Route Start
router.get('/branch_office/:id', services.branch_office);
// Get Contact Route End

// Store Appointment Edition Route Start
/*router.post('/editions', function(req, res) {
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
});*/
// Store Appointment Edition Route End

// Get Appointment Edition Route Start
router.get('/editions', services.editions);
// Get Appointment Edition Route End

// Store Appointment Job Title Route Start
/*router.post('/job_title', function(req, res) {
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
});*/
// Store Appointment Job Title Route End

// Store Appointment Route Start
/*router.post('/appointments', function(req, res) {
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
});*/
// Store Appointment Route End

// Get Appointment Route Start
router.get('/appointments/:edition_id', services.appointments);
// Get Appointment Route End

// Get Appointment Details Route Start
router.get('/appointment_details/:appointment_id', services.appointment_details);
// Get Appointment Details Route End

// Show Contact Form Start
/*router.get('/contact', function(req, res) {
  res.render('contact');
});*/
// Show Contact Form End

// Store Contact from Form Start
/*router.post('/test', function(req, res) {

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
});*/
// Store Contact from Form End

// Show About Form Start
/*router.get('/about2', function(req, res) {
  res.render('about');
});*/
// Show About Form End

// Store About from Form Start
/*router.post('/test2', function(req, res) {

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
});*/
// Store About from Form End

// Store Sector Route Start
/*router.post('/sectors', function(req, res) {
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
});*/
// Store Sector Route End

// Get Sector Route Start
router.get('/sectors', services.sectors);
// Get Sector Route End

// Store Port Route Start
/*router.post('/ports', function(req, res) {
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
});*/
// Store Port Route End

// Get Port Route Start
router.get('/ports', services.ports);
// Get Port Route End

// Store Vessel Route Start
/*router.post('/vessels', function(req, res) {
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
});*/
// Store Vessel Route End

// Get Vessel Route Start
router.get('/vessels/:sector_id/:port_id', services.vessels);
// Get Vessel Route End

// Get Advertisements Route Start
router.get('/advertisements', services.advertisements);
// Get Advertisements Route End

// Store Subscription Route Start
router.post('/subscription', services.subscription);
// Store Subscription Route End

// Get Versions Route Start
router.get('/versions', services.versions);
// Get Versions Route End

// Get Agent Route Start
router.get('/agent/:id', services.agent);
// Get Agent Route End

// Get Break Bulk Sectors Route Start
router.get('/break_bulk_sectors/:sector_id', services.break_bulk_sectors);
// Get Break Bulk Sectors Route End

// Get Break Bulk Vessels Route Start
router.get('/break_bulk_vessels/:break_bulk_sector_id', services.break_bulk_vessels);
// Get Break Bulk Vessels Route End

// Get Shipping Gazette Sectors Route Start
// router.get('/shipping_gazette_sectors/:sector_id', services.shipping_gazette_sectors);
// Get Shipping Gazette Sectors Route End

// Get Gazette Vessels Route Start
router.get('/gazette_vessels/:service_id', services.gazette_vessels);
// Get Gazette Vessels Route End

// Get Gazette Agent Route Start
router.get('/gazette_agent/:id', services.gazette_agent);
// Get Gazette Agent Route End

// Get Event Categories Route Start
router.get('/event_categories', services.event_categories);
// Get Event Categories Route End

// Get Meet Expert Route Start
router.get('/meet_expert/:skip/:limit', services.meet_expert);

module.exports = router;
