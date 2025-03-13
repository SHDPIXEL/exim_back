const mongoose = require('mongoose');

// Year Book Schema
const YearBookSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  url:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const YearBook = module.exports = mongoose.model('YearBook', YearBookSchema);
