const mongoose = require("mongoose");

let Adds = require("../models/adds");
// let SelectedAd = require("../models/selectedAds")

let selectedAd = require("../models/selectedAds");

module.exports = {
  createAdd: async function (req, res) {
    try {
      // console.log("Received request at:", new Date().toISOString());
      // console.log("Request body:", req.body);
      // console.log("Uploaded Images:", req.files?.images);
      // console.log("Uploaded Videos:", req.files?.videos);

      const { position, status } = req.body;

      // Extract unique image paths
      const imagePaths = [];
      const seenPaths = new Set();
      if (req.files?.images) {
        req.files.images.forEach((file) => {
          if (!seenPaths.has(file.path)) {
            seenPaths.add(file.path);
            imagePaths.push({ filePath: file.path, status: "Active" });
          }
        });
      }

      // Extract unique video paths
      const videoPaths = [];
      if (req.files?.videos) {
        req.files.videos.forEach((file) => {
          videoPaths.push({ filePath: file.path, status: "Active" });
        });
      }

      // console.log("Final Image Paths:", imagePaths);
      // console.log("Final Video Paths:", videoPaths);

      // Ensure all images are captured
      if (imagePaths.length !== req.files?.images?.length) {
        console.error("Some images were not processed!");
      }

      // Create and save the new Ad entry
      const newAd = new Adds({
        position,
        images: imagePaths,
        videos: videoPaths,
        status: status || "Active",
      });

      // console.log("New Ad to be saved:", newAd);

      await newAd.save();
      res.status(201).json({ message: "Ad created successfully", newAd });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllAdds: async function (req, res) {
    try {
      const allAdds = await Adds.find();

      if (allAdds.length === 0) {
        return res.status(404).json({ message: "No ads found" });
      }

      const updatedAdds = allAdds.map((add) => {
        // console.log("DEBUG - Add object:", add);

        const updatedImages = Array.isArray(add.images)
          ? add.images
              .map((image) =>
                image && image.filePath
                  ? {
                      filePath: `http://192.168.1.11:4010/${image.filePath.replace(
                        /\\/g,
                        "/"
                      )}`,
                      status: image.status, // Include image status
                    }
                  : null
              )
              .filter(Boolean) // Remove null values
          : [];

        const updatedVideos = Array.isArray(add.videos)
          ? add.videos
              .map((video) =>
                video && video.filePath
                  ? {
                      filePath: `http://192.168.1.11:4010/${video.filePath.replace(
                        /\\/g,
                        "/"
                      )}`,
                      status: video.status, // Include video status
                    }
                  : null
              )
              .filter(Boolean) // Remove null values
          : [];

        return {
          ...add.toObject(),
          images: updatedImages,
          videos: updatedVideos,
        };
      });

      // console.log("DEBUG - Updated Adds:", updatedAdds);

      res.status(200).json(updatedAdds);
    } catch (error) {
      console.error("Error retrieving ads:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateMediaStatus: async function (req, res) {
    try {
      const { addId, mediaType, mediaIndex, status } = req.body;

      // Validate mediaType
      if (!["images", "videos"].includes(mediaType)) {
        return res.status(400).json({ message: "Invalid media type" });
      }

      // Validate status
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Retrieve the ad by its ID
      const ad = await Adds.findById(addId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      // Check if media exists at the given index
      const mediaArray = ad[mediaType];
      if (!mediaArray || mediaIndex < 0 || mediaIndex >= mediaArray.length) {
        return res.status(404).json({ message: "Media not found" });
      }

      // Update the status of the media item
      const updatedAd = await Adds.findOneAndUpdate(
        { _id: addId },
        { $set: { [`${mediaType}.${mediaIndex}.status`]: status } },
        { new: true }
      );

      res.status(200).json({
        message: "Media status updated successfully",
        updatedMedia: updatedAd[mediaType][mediaIndex], // Returning only the updated media
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteAdd: async function (req, res) {
    try {
      const { addId } = req.params; // Get addId from URL parameters

      // Validate if addId is provided
      if (!addId) {
        return res.status(400).json({ message: "Ad ID is required" });
      }

      // Check if addId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(addId)) {
        return res.status(400).json({ message: "Invalid Ad ID format" });
      }

      // Delete the ad using deleteOne()
      const result = await Adds.deleteOne({ _id: addId });

      // If no documents were deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Ad not found" });
      }

      res.status(200).json({ message: "Ad deleted successfully" });
    } catch (error) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getMediaFromAdds: async function (req, res) {
    try {
      const baseURL = "http://192.168.1.11:4010/"; // 🔹 Your server base URL

      const ads = await Adds.find({ status: "Active" }, "images videos").lean();

      if (!ads || ads.length === 0) {
        return res.json({ success: false, message: "No active ads found" });
      }

      // 🛠 Normalize paths to prevent double prefixes
      ads.forEach((ad) => {
        ad.images = ad.images.map((image) => ({
          ...image,
          filePath:
            baseURL + image.filePath.replace(/\\/g, "/").replace(/^adds\//, ""), // Fix slashes & duplicate "adds/"
        }));
        ad.videos = ad.videos.map((video) => ({
          ...video,
          filePath:
            baseURL + video.filePath.replace(/\\/g, "/").replace(/^adds\//, ""), // Fix slashes & duplicate "adds/"
        }));
      });

      console.log("✅ Fixed Ads Data:", JSON.stringify(ads, null, 2));

      res.json({ success: true, ads });
    } catch (error) {
      console.error("❌ Error fetching ads:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },

  saveSelectedMedia: async function (req, res) {
    try {
      const { position, mediaUrl, mediaType } = req.body;

      const newAd = new selectedAd({
        selectedMedia: [{ position, mediaUrl, mediaType }],
      });

      await newAd.save();
      res
        .status(201)
        .json({ success: true, message: "Ad saved successfully", newAd });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error saving ad",
        error: error.message,
      });
    }
  },
};
