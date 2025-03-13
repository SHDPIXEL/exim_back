const mongoose = require('mongoose');

// Advertisement Schema
const AdvertisementSchema = mongoose.Schema({
  category:{
    type: String,
    required: true
  },
  image:{
    type: String
  },
  url:{
    type: String
  },
  video:{
    type: String
  },
  status:{
    type: String,
    required: true
  },
  order:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Advertisement = module.exports = mongoose.model('Advertisement', AdvertisementSchema);
