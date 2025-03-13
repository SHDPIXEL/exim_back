const mongoose = require('mongoose');

// Event Schema
const EventSchema = mongoose.Schema({
  category_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventCategory',
  },
  name:{
    type: String,
    required: true
  },
  url:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  venue:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  date_two:{
    type: String
  },
  date_three:{
    type: String
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Event = module.exports = mongoose.model('Event', EventSchema);
