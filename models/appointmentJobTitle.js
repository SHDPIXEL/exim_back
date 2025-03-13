const mongoose = require('mongoose');

// Customs Schema
const AppointmentJobTitleSchema = mongoose.Schema({
  job_title:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const AppointmentJobTitle = module.exports = mongoose.model('AppointmentJobTitle', AppointmentJobTitleSchema);
