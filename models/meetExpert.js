const mongoose = require('mongoose');

// Meet Our Expert Schema
const MeetExpertSchema = mongoose.Schema({
  image:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  }
}, {timestamps: true});

const MeetExpert = module.exports = mongoose.model('MeetExpert', MeetExpertSchema);
