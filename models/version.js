const mongoose = require('mongoose');

// Version Schema
const VersionSchema = mongoose.Schema({
  android:{
    type: String,
    required: true
  },
  ios: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Version = module.exports = mongoose.model('Version', VersionSchema);
