const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  selectedMedia: [
    {
      position: String, // e.g., "top-left"
      startDate: { type: Date, required: true }, // Start date for the position
      endDate: { type: Date, required: true }, // End date for the position
      media: [
        {
          mediaUrl: String, // URL of the media
          mediaType: String, // "image" or "video"
          sequenceNumber: Number, // Sequence number
          url: String, // URL associated with the media
          status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // Media status
        }
      ]
    }
  ]
});

const SelectedAd = mongoose.model("Ad", adSchema);
module.exports = SelectedAd;
