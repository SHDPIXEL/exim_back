const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ text: String, votes: { type: Number, default: 0 } }],
    correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },  
    email: { type: String, required: true },   
    votedEmails: [{ type: String }] // ✅ track who voted   
  },
  { timestamps: true }
);  

module.exports = mongoose.model('Poll', PollSchema);
