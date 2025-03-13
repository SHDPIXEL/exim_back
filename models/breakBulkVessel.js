const mongoose = require('mongoose');


// Break Bulk Vessel Schema
const BreakBulkVesselSchema = mongoose.Schema({
  break_bulk_sector_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BreakBulkSector'
  },
  break_bulk_sector_ref_id:{
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
  /*cy_cut_off_date_time:{
    type: String,
    required: true
  },*/
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

const BreakBulkVessel = module.exports = mongoose.model('BreakBulkVessel', BreakBulkVesselSchema);
