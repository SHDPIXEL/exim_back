require("dotenv").config();
const express = require('express');
const cors = require("cors");
const path = require('path');
const mongoose = require("mongoose"); // For JavaScript
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const moment = require('moment');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');

mongoose.connect('mongodb://127.0.0.1:27017/exim_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB');
});
mongoose.promise = global.promise;


const PORT = process.env.PORT || 3000; // Use a fallback port if PORT is undefined

if (PORT === 3000) {
  console.error('Error: No port specified. Please set the PORT environment variable.');
  process.exit(1); // Exit the application with an error
}
// Init App
const app = express();

// Use CORS middleware for all routes
app.use(cors());  // Enable CORS for all routes

// Load View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "bower_components")));
app.use(express.static(path.join(__dirname, "public")));

// app.use(cors());
// app.use(cookieParser('keyboardcat'));

// Body Parser Middleware
// parse application/json
app.use(bodyParser.json({limit: '50mb'}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

// Express Session Middleware
app.use(session({
  secret: 'keyboardcat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  // res.locals.messages = require('express-messages')(req, res) || null;
  res.locals.messages = req.flash(); 
  // console.log(res.locals.messages);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// no timeout for all requests, your server will be DoS'd
app.use('*', function(req, res, next){
  req.setTimeout(500000)
  next()
});



// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.moment = moment;
  res.locals.url = req.url || null;
  next();
});

// Route Files
app.get('/', function(req, res) {
  res.redirect('/users/login');
});

// Access Control
function is_authenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  // else {
    req.flash('msg', 'Please Login First');
    return res.redirect('/users/login');
  // }
}

app.get('/dashboard', is_authenticated, function(req, res) {
  res.render('dashboard');
});

app.get('/polls/add', (req, res) => {
  console.log("User in request:", req.user);
  res.render('polls/add_poll', { user: req.user || null, url: req.originalUrl });
});

app.get('/polls/list', (req, res) => {
  console.log("User in request:", req.user);
  res.render('polls/list_polls', { user: req.user || null, url: req.originalUrl });
});

let users = require('./routes/users');
let app_users = require('./routes/app_users');
let about = require('./routes/about');
let news = require('./routes/news');
let sectors = require('./routes/sectors');
let terminals = require('./routes/terminals');
let vessels = require('./routes/vessels');
let job_titles = require('./routes/job_titles');
let editions = require('./routes/editions');
let appointments = require('./routes/appointments');
let events = require('./routes/events');
let customs = require('./routes/customs');
let forexes = require('./routes/forexes');
let digital_copies = require('./routes/digital_copies');
let year_books = require('./routes/year_books');
let testimonials = require('./routes/testimonials');
let contacts = require('./routes/contacts');
let currencies = require('./routes/currencies');
let advertisements = require('./routes/advertisements');
let newsletter = require('./routes/newsletter');
let line_agents = require('./routes/line_agents');
let break_bulk_sectors = require('./routes/break_bulk_sectors');
let break_bulk_vessels = require('./routes/break_bulk_vessels');
let gazette_line_agents = require('./routes/gazette_line_agents');
let event_categories = require('./routes/event_categories');
let meet_expert = require('./routes/meet_expert');
let question_answers = require('./routes/question_answers');
let gazette_vessels = require('./routes/gazette_vessels');
let logs = require('./routes/logs');
let services = require('./routes/services');
let polls = require('./routes/polls')
 

app.use('/users', users);
app.use('/app_users', app_users);
app.use('/about', about);
app.use('/news', news);
app.use('/sectors', sectors);
app.use('/terminals', terminals);
app.use('/vessels', vessels);
app.use('/job_titles', job_titles);
app.use('/editions', editions);
app.use('/appointments', appointments);
app.use('/events', events);
app.use('/customs', customs);
app.use('/forexes', forexes);
app.use('/digital_copies', digital_copies);
app.use('/year_books', year_books);
app.use('/testimonials', testimonials);
app.use('/contacts', contacts);
app.use('/currencies', currencies);
app.use('/advertisements', advertisements);
app.use('/newsletter', newsletter);
app.use('/line_agents', line_agents);
app.use('/break_bulk_sectors', break_bulk_sectors);
app.use('/break_bulk_vessels', break_bulk_vessels);
app.use('/gazette_line_agents', gazette_line_agents);
app.use('/event_categories', event_categories);
app.use('/meet_expert', meet_expert);
app.use('/question_answers', question_answers);
app.use('/gazette_vessels', gazette_vessels);
app.use('/logs', logs);
app.use('/services', services);
app.use('/polls',polls);
// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
