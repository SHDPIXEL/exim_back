const mongoose = require('mongoose');

// Event Category Schema
const EventCategorySchema = mongoose.Schema({
  category:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const EventCategory = module.exports = mongoose.model('EventCategory', EventCategorySchema);
