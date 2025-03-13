const mongoose = require('mongoose');

// Customs Schema
const CustomsSchema = mongoose.Schema({
  currency:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  import:{
    type: String,
    required: true
  },
  export:{
    type: String,
    required: true
  },
  notification_no:{
    type: String,
    required: true
  },
  sql_id:{
    type: String
  }
}, {timestamps: true});

const Customs = module.exports = mongoose.model('Customs', CustomsSchema);
