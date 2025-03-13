const mongoose = require('mongoose');

// Customs Schema
const CurrencySchema = mongoose.Schema({
  currency:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Currency = module.exports = mongoose.model('Currency', CurrencySchema);
