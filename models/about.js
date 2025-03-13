const mongoose = require('mongoose');


// About Edition Schema
const AboutEditionSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  }
}, {timestamps: true});

// About Schema
const AboutSchema = mongoose.Schema({
  description:{
    type: String,
    required: true
  },
  networks:{
    type: String,
    required: true
  },
  readers:{
    type: String,
    required: true
  },
  editions:[AboutEditionSchema]
}, {timestamps: true});

const About = module.exports = mongoose.model('About', AboutSchema);
