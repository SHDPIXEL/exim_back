const mongoose = require('mongoose');

// Testimonial Schema
const TestimonialSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  company_designation:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
}, {timestamps: true});

const Testimonial = module.exports = mongoose.model('Testimonial', TestimonialSchema);
