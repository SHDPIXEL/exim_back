const mongoose = require("mongoose");

// Digital Copy Schema
const DigitalCopySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    location:{
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const DigitalCopy = (module.exports = mongoose.model(
  "DigitalCopy",
  DigitalCopySchema
));
