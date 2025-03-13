const mongoose = require('mongoose');

// App User Schema
const AppUserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  company_name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  mobile:{
    type: String,
    required: true
  },
  nature_business:{
    type: String,
    required: true
  },
  subscribe_newsletter:{
    type: String,
    required: true
  }
}, {timestamps: true});

const AppUser = module.exports = mongoose.model('AppUser', AppUserSchema);
