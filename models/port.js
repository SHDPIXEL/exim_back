const mongoose = require('mongoose');

// Port Schema
const PortSchema = mongoose.Schema({
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

const Port = module.exports = mongoose.model('Port', PortSchema);
