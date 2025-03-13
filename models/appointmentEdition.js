const mongoose = require('mongoose');

// Customs Schema
const AppointmentEditionSchema = mongoose.Schema({
  edition:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const AppointmentEdition = module.exports = mongoose.model('AppointmentEdition', AppointmentEditionSchema);
