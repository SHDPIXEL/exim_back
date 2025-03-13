const mongoose = require('mongoose');

// Contact Schema
const ContactSchema = mongoose.Schema({
  office:{
    type: String,
    required: true
  },
  type:{
    type: String,
    required: true
  },
  address:{
    type: String
  },
  telephone: {
    type: String
  },
  fax: {
    type: String
  },
  emails: [{
    email: String
  }]
}, {timestamps: true});

const Contact = module.exports = mongoose.model('Contact', ContactSchema);
