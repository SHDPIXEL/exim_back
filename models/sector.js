const mongoose = require('mongoose');

// Sector Schema
const SectorSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  ref_id: {
  	type: String,
  	required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Sector = module.exports = mongoose.model('Sector', SectorSchema);
