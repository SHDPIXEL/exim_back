const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  selectedMedia: [
    {
      position: String, // e.g., "top-left"
      media: [
        {
          mediaUrl: String, // URL of the media
          mediaType: String, // "image" or "video"
          sequenceNumber: Number, // Sequence number
          status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // Media status
        }
      ]
    }
  ]
});

const SelectedAd = mongoose.model("Ad", adSchema);
module.exports = SelectedAd;
