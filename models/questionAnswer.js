const mongoose = require('mongoose');


// Question Answer Schema
const QuestionAnswerSchema = mongoose.Schema({
  meet_expert_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetExpert'
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, {timestamps: true});

const QuestionAnswer = module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema);
