const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
    selectedMedia: [
        {
            position: String, // Static position (e.g., "top-left", "bottom-right")
            mediaUrl: String, // Selected image/video URL
            mediaType: String // "image" or "video"
        }
    ]
});

const selectedAd = mongoose.model("Ad", adSchema);
module.exports= selectedAd;