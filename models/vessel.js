const mongoose = require('mongoose');


// Vessel Schema
const VesselSchema = mongoose.Schema({
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
  date:{
    type: Date,
    required: true
  },
  eta:{
    type: String,
    required: true
  },
  etd:{
    type: String,
    required: true
  },
  cy_cut_off_date_time:{
    type: String,
    required: true
  },
  vessel_name_via_no:{
    type: String,
    required: true
  },
  voy_no:{
    type: String,
    required: true
  },
  rot_no_date:{
    type: String,
    required: true
  },
  /*line:{
    type: String,
    required: true
  },
  agent:{
    type: String,
    required: true
  },*/
  /*carting_point:{
    type: String,
    required: true
  }*/
}, {timestamps: true});

const Vessel = module.exports = mongoose.model('Vessel', VesselSchema);
