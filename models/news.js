const mongoose = require('mongoose');

// News Schema
const NewsSchema = mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference Category Model
    required: true,
  },
  date:{
    type: Date,
    required: true
  },
  headline:{
    type: String,
    required: true
  },
  breaking_news:{
    type: String
  },
  description:{
    type: String,
    required: true
  },
  four_lines:{
    type: String
  },
  image:{
    type: String
  },
  sql_id:{
    type: String
  },
  inFocus:{
    type: Boolean,
    default: false
  }
}, {timestamps: true});

const News = mongoose.model('News', NewsSchema)
module.exports = News;
