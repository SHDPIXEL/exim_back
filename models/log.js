const mongoose = require('mongoose');

// Contact Schema
const LogSchema = mongoose.Schema({
  user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message:{
    type: String,
    required: true
  },
  table: {
    type: String
  }
}, {timestamps: true});

const Log = module.exports = mongoose.model('Log', LogSchema);
