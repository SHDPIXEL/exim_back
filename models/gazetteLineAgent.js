const mongoose = require('mongoose');

// Shipping Gazette Schema
const GazetteLineAgentSchema = mongoose.Schema({
  sector_id:{
    type: String
  },
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
  line:{
    type: String,
    required: true
  },
  agent:{
    type: String,
    required: true
  }
}, {timestamps: true});

const GazetteLineAgent = module.exports = mongoose.model('GazetteLineAgent', GazetteLineAgentSchema);
