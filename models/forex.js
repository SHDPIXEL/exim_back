const mongoose = require('mongoose');

// Forex Schema
const ForexSchema = mongoose.Schema({
  currency:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  tt_selling_rates_clean_remittance_outwards:{
    type: String,
    required: true
  },
  bill_selling_rates_for_imports:{
    type: String,
    required: true
  },
  tt_buying_rates_clean_remittance_inwards:{
    type: String,
    required: true
  },
  bill_buying_rates_for_exports:{
    type: String,
    required: true
  },
  sql_id:{
    type: String
  }
}, {timestamps: true});

const Forex = module.exports = mongoose.model('Forex', ForexSchema);
