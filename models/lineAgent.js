const mongoose = require('mongoose');

// Line Agent Schema
const LineAgentSchema = mongoose.Schema({
  sector_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector'
  },
  port_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Port'
  },
  sector_ref_id:{
    type: String,
    required: true
  },
  port_ref_id:{
    type: String,
    required: true
  },
  line:{
    type: String,
    required: true
  },
  agent:{
    type: String,
    required: true
  },
  carting_point:{
    type: String,
    required: true
  }
}, {timestamps: true});

const LineAgent = module.exports = mongoose.model('LineAgent', LineAgentSchema);
