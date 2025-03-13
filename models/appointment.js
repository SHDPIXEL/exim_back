const mongoose = require('mongoose');

// Customs Schema
const AppointmentSchema = mongoose.Schema({
  edition_id:{
   	type: mongoose.Schema.Types.ObjectId,
   	ref: 'AppointmentEdition'
  },
  job_title_id:{
   	type: mongoose.Schema.Types.ObjectId,
   	ref: 'AppointmentJobTitle'
  },
  date:{
   	type: Date,
   	required: true
  },
  description:{
   	type: String,
   	required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Appointment = module.exports = mongoose.model('Appointment', AppointmentSchema);
