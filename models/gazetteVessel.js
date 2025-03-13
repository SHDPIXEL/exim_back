const mongoose = require('mongoose');


// Gazette Vessel Schema
const GazetteVesselSchema = mongoose.Schema({
  gazette_sector_id:{
    type: String,
    required: true
  },
  port_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Port'
  },
  service_id:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  item:{
    type: String,
    required: true
  },
  desc_one:{
    type: String,
    required: true
  },
  desc_two:{
    type: String,
    required: true
  },
  order:{
    type: Number,
    required: true
  }
}, {timestamps: true});

const GazetteVessel = module.exports = mongoose.model('GazetteVessel', GazetteVesselSchema);
