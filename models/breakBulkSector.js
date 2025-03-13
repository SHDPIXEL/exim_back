const mongoose = require('mongoose');

// Sector Schema
const BreakBulkSectorSchema = mongoose.Schema({
  sector_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector'
  },
  name:{
    type: String,
    required: true
  },
  ref_id: {
  	type: String,
  	required: true
  },
  status:{
    type: Number,
    required: true
  }
}, {timestamps: true});

const BreakBulkSector = module.exports = mongoose.model('BreakBulkSector', BreakBulkSectorSchema);
