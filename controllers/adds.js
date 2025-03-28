const mongoose = require("mongoose");

let Adds = require("../models/adds");
// let SelectedAd = require("../models/selectedAds")

let selectedAd = require("../models/selectedAds");

module.exports = {
  createAdd: async function (req, res) {
    try {
      const { status, url } = req.body;

      // Ensure at least one media file is uploaded
      if (!req.files || (!req.files.images && !req.files.videos)) {
        return res
          .status(400)
          .json({ message: "Please upload an image or a video" });
      }

      let media = {}; // To store the single media object

      // Handle Image Upload (Priority over video if both are uploaded)
      if (req.files.images && req.files.images.length > 0) {
        media = {
          filePath: req.files.images[0].path, // Take only the first image
          url: url || "#", // Default to "#" if no URL provided
          mediaType: "image",
          status: "Active",
        };
      }
      // Handle Video Upload (If no image is uploaded)
      else if (req.files.videos && req.files.videos.length > 0) {
        media = {
          filePath: req.files.videos[0].path, // Take only the first video
          url: url || "#",
          mediaType: "video",
          status: "Active",
        };
      }

      // Create and save the new Ad entry
      const newAd = new Adds({
        position: "No Position", // Provide a default position if none is given
        media,
        status: status || "Active",
      });

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
                      filePath: `https://eximback.demo.shdpixel.com/${image.filePath.replace(
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
                      filePath: `https://eximback.demo.shdpixel.com/${video.filePath.replace(
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

  getAllAddsAdmin: async function (req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 25; // Default limit to 25
      const skip = (page - 1) * limit;

      // Get total count for pagination metadata
      const totalRecords = await Adds.count();
      const totalPages = Math.ceil(totalRecords / limit);

      // Fetch paginated data
      const allAdds = await Adds.find().skip(skip).limit(limit);

      if (allAdds.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No ads found" });
      }

      // Transform data
      const updatedAdds = allAdds.map((add) => ({
        ...add.toObject(),
        media:
          add.media && add.media.filePath
            ? {
                filePath: `https://eximback.demo.shdpixel.com/${add.media.filePath.replace(
                  /\\/g,
                  "/"
                )}`,
                url: add.media.url,
                mediaType: add.media.mediaType,
                status: add.media.status,
              }
            : null,
      }));

      return res.status(200).json({
        success: true,
        message: "Ads retrieved successfully",
        data: updatedAdds,
        recordsTotal: totalRecords, // Required for DataTables
        recordsFiltered: totalRecords, // Required for DataTables
        pagination: {
          totalRecords,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error retrieving ads:", error.message);
      res.status(500).json({
        success: false,
        message: "Error retrieving ads",
        error: error.message,
      });
    }
  },

  updateMediaStatus: async function (req, res) {
    try {
      const { addId, status } = req.body;
  
      // Validate status
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
  
      // Find the ad by ID
      const ad = await Adds.findById(addId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      // Check if media exists
      if (!ad.media) {
        return res.status(404).json({ message: "Media not found" });
      }
  
      // Update the media status
      ad.media.status = status;
      await ad.save();
  
      res.status(200).json({
        message: "Media status updated successfully",
        updatedMedia: ad.media, // Returning updated media object
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
      const baseURL = "https://eximback.demo.shdpixel.com/"; // Server base URL
  
      const ads = await Adds.find({ status: "Active" }).lean();
  
      if (!ads || ads.length === 0) {
        return res.json({ success: false, message: "No active ads found" });
      }
  
      // Normalize file paths and ensure the base URL is prepended
      ads.forEach((ad) => {
        if (ad.media && ad.media.filePath) {
          // Ensure forward slashes and prepend baseURL
          ad.media.filePath = baseURL + ad.media.filePath.replace(/\\/g, "/");
        }
      });
  
      console.log("✅ Fixed Ads Data:", JSON.stringify(ads, null, 2));
  
      res.json({ success: true, ads });
    } catch (error) {
      console.error("❌ Error fetching ads:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
  
  saveSelectedMedia: async function (req, res) {
    try {
      console.log("Request body:", req.body);
      const { position, mediaUrls, startDate, endDate } = req.body;
  
      if (!mediaUrls) {
        return res
          .status(400)
          .json({ success: false, message: "No media selected" });
      }
  
      let mediaArray;
      try {
        mediaArray = JSON.parse(mediaUrls);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid media data format" });
      }
  
      console.log("Received media:", mediaArray);
  
      // Find if an ad with the same position exists
      let existingAd = await selectedAd.findOne({
        "selectedMedia.position": position,
      });
  
      if (existingAd) {
        let mediaIndex = existingAd.selectedMedia.findIndex(
          (media) => media.position === position
        );
  
        if (mediaIndex !== -1) {
          let existingUrls = new Set(
            existingAd.selectedMedia[mediaIndex].media.map(
              (item) => item.mediaUrl
            )
          );
  
          let newMediaItems = mediaArray
            .filter((newMedia) => !existingUrls.has(newMedia.mediaUrl))
            .map((newMedia) => ({
              mediaUrl: newMedia.mediaUrl,
              mediaType: newMedia.mediaType,
              sequenceNumber: newMedia.sequenceNumber,
              url: newMedia.url, // ✅ Include the URL field
              status: "Active",
            }));
  
          if (newMediaItems.length > 0) {
            // ✅ Update existing media list for the position
            await selectedAd.updateOne(
              { _id: existingAd._id, "selectedMedia.position": position },
              {
                $push: { "selectedMedia.$.media": { $each: newMediaItems } },
                $set: {
                  "selectedMedia.$.startDate": startDate,
                  "selectedMedia.$.endDate": endDate,
                },
              }
            );
          }
        }
  
        return res.status(200).json({
          success: true,
          message: "Ad updated successfully",
          updatedAd: await selectedAd.findById(existingAd._id),
        });
      } else {
        // ✅ Create a new ad entry if no existing one is found
        const newAd = new selectedAd({
          selectedMedia: [
            {
              position,
              startDate,
              endDate,
              media: mediaArray.map((media) => ({
                mediaUrl: media.mediaUrl,
                mediaType: media.mediaType,
                sequenceNumber: media.sequenceNumber,
                url: media.url, // ✅ Include the URL field
                status: "Active",
              })),
            },
          ],
        });
  
        console.log("New Ad:", newAd);
  
        await newAd.save();
        return res.status(201).json({
          success: true,
          message: "Ad saved successfully",
          newAd,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error saving ad",
        error: error.message,
      });
    }
  },
  

  getSelectedMedia: async function (req, res) {
    try {
      const allSelectedAds = await selectedAd.find();
  
      // Transform data to rename mediaUrl -> filePath and include additional fields
      const transformedAds = allSelectedAds.map((ad) => ({
        ...ad.toObject(),
        selectedMedia: ad.selectedMedia.map((media) => ({
          position: media.position,
          media: media.media.map((item) => ({
            filePath: item.mediaUrl, // Rename mediaUrl to filePath
            mediaType: item.mediaType,
            sequenceNumber: item.sequenceNumber, // Include sequenceNumber
            status: item.status, // Include status field
            url: item.url || "", // ✅ Include URL (ensure it's not undefined)
          })),
        })),
      }));
  
      return res.status(200).json({
        success: true,
        message: "Selected Ads Retrieved successfully",
        selectedAds: transformedAds,
      });
    } catch (error) {
      console.error("Error retrieving selected ads:", error.message);
      res.status(500).json({
        success: false,
        message: "Error retrieving selected ads",
        error: error.message,
      });
    }
  },
  

  getSelectedMediaAdmin: async function (req, res) {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 25;
      const skip = (page - 1) * limit;

      // Fetch total count
      const totalRecords = await selectedAd.count();

      // Fetch paginated data, sorted by creation date (if needed)
      const allSelectedAds = await selectedAd
        .find()
        .sort({ _id: 1 }) // Sorting to maintain order
        .skip(skip)
        .limit(limit);

      // Function to format date as 'DD-MM-YYYY'
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${d.getFullYear()}`;
      };

      // Transform data
      const transformedAds = allSelectedAds.map((ad) => ({
        ...ad.toObject(),
        selectedMedia: ad.selectedMedia.map((media) => ({
          position: media.position,
          startDate: formatDate(media.startDate), // Corrected path
          endDate: formatDate(media.endDate), // Corrected path
          media: media.media.map((item) => ({
            filePath: item.mediaUrl,
            mediaType: item.mediaType,
            sequenceNumber: item.sequenceNumber,
            status: item.status,
          })),
        })),
      }));

      return res.status(200).json({
        success: true,
        message: "Selected Ads Retrieved successfully",
        selectedAds: transformedAds,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        pagination: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error retrieving selected ads:", error.message);
      res.status(500).json({
        success: false,
        message: "Error retrieving selected ads",
        error: error.message,
      });
    }
  },

  deleteSelectedMedia: async function (req, res) {
    try {
      console.log("req delete params:", req.params); // Debugging log
      const { id } = req.params; // Use 'id' instead of 'addId'

      if (!id) {
        return res.status(400).json({ message: "Ad ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Ad ID format" });
      }

      const result = await selectedAd.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Ad not found" });
      }

      res.status(200).json({ message: "Ad deleted successfully" });
    } catch (error) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateSelectedMediaStatus: async function (req, res) {
    try {
      console.log("required", req.body);
      const { addId, mediaType, sequenceNumber, status } = req.body;

      const ad = await selectedAd.findById(addId);
      if (!ad) return res.status(404).json({ message: "Ad not found" });

      ad.selectedMedia.forEach((media) => {
        media.media.forEach((item) => {
          if (
            item.mediaType === mediaType &&
            item.sequenceNumber === sequenceNumber
          ) {
            item.status = status;
          }
        });
      });

      await ad.save();
      res.json({ message: "Media status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating media status" });
    }
  },

  updateMediaSequence: async function (req, res) {
    try {
      const { addId, mediaType, oldSequence, newSequence } = req.body;

      if (!addId || !mediaType || oldSequence == null || newSequence == null) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const ad = await selectedAd.findById(addId);
      if (!ad) return res.status(404).json({ message: "Ad not found" });

      let mediaList = ad.selectedMedia.flatMap((media) => media.media);
      let mediaItem = mediaList.find(
        (item) =>
          item.mediaType === mediaType && item.sequenceNumber == oldSequence
      );

      if (!mediaItem)
        return res.status(404).json({ message: "Media not found" });

      let existingItem = mediaList.find(
        (item) =>
          item.mediaType === mediaType && item.sequenceNumber == newSequence
      );

      if (existingItem) {
        existingItem.sequenceNumber = oldSequence; // Swap sequence numbers
      }

      mediaItem.sequenceNumber = newSequence; // Assign new sequence

      await ad.save();
      res.json({ message: "Sequence updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
