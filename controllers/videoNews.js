const VideoNews = require("../models/videoNews");

const categoryMap = {
  1: "Shipping News",
  2: "Trade News",
  3: "Port News",
  4: "Transport News",
  5: "Indian Economy",
  6: "Special Report",
  7: "International",
  8: "Aviation Cargo Express",
};

module.exports = {
  // Create Video News
  createVideoNews: async (req, res) => {
    try {
      const {
        category_id,
        date,
        headline,
        breaking_news,
        description,
        four_lines,
        urls,
        inFocus,
      } = req.body;
  
      const videoPath = req.file ? req.file.path : "";
      
      // Check if there's a video uploaded
      const isVideo = videoPath ? true : false;
  
      const newVideoNews = new VideoNews({
        category_id,
        date,
        headline,
        breaking_news,
        description,
        four_lines,
        videos: videoPath,
        urls,
        inFocus,
        isVideo, // Set isVideo to true if a video is uploaded
      });
  
      await newVideoNews.save();
      res.status(201).json({
        message: "Video news created successfully",
        data: newVideoNews,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  

  // Fetch All Video News

  getAllVideoNews: async (req, res) => {
    try {
      const baseUrl = "http://192.168.1.11:4010";
      const news = await VideoNews.find();
  
      const updatedNews = news.map((item) => {
        return {
          ...item._doc,
          category_name: categoryMap[item.category_id] || "Unknown Category",
          isVideo: item.isVideo,  // Directly use the isVideo field from the database
        };
      });
  
      res.status(200).json(updatedNews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  

  // Fetch Single Video News
  getVideoNewsById: async (req, res) => {
    try {
      const baseUrl = "http://192.168.1.11:4010";
      const news = await VideoNews.findById(req.params.id);
  
      if (!news) return res.status(404).json({ message: "News not found" });
  
      const responseData = {
        ...news._doc,
        videos: news.videos ? `${baseUrl}/${news.videos}` : null,
        category_name: categoryMap[news.category_id] || "Unknown Category",
        isVideo: news.isVideo, // Directly use the isVideo field from the database
      };
  
      console.log("Response Data:", responseData); // Debugging log
  
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  

  // Update Video News
  updateVideoNews: async (req, res) => {
    try {
      const news = await VideoNews.findById(req.params.id);
      if (!news) return res.status(404).json({ message: "News not found" });
  
      const {
        category_id,
        date,
        headline,
        breaking_news,
        description,
        four_lines,
        inFocus,
      } = req.body;
  
      const updatedData = {
        category_id: category_id || news.category_id,
        date: date || news.date,
        headline: headline || news.headline,
        breaking_news: breaking_news || news.breaking_news,
        description: description || news.description,
        four_lines: four_lines || news.four_lines,
        inFocus: inFocus !== undefined ? inFocus : news.inFocus,
        videos: req.file ? req.file.path : news.videos,
      };
  
      // Calculate isVideo after updating the video field
      updatedData.isVideo = updatedData.videos && updatedData.videos.trim() !== "";
  
      const updatedNews = await VideoNews.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      res.status(200).json({
        message: "Video news updated successfully",
        data: updatedNews,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  

  // Delete Video News
  deleteVideoNews: async (req, res) => {
    try {
      const news = await VideoNews.findById(req.params.id); // Find the news

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      await VideoNews.deleteOne({ _id: req.params.id }); // Alternative delete method

      res.status(200).json({ message: "Video news deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  toggleInFocus: async function (req, res) {
    try {
      const news = await VideoNews.findById(req.params.id);

      if (!news) return res.status(404).json({ message: "News not found" });

      // Toggle inFocus value
      news.inFocus = !news.inFocus;
      await news.save();

      res.status(200).json({
        message: "inFocus status updated successfully",
        inFocus: news.inFocus,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPaginatedNews: async function (req, res) {
    try {
        console.log("req data",req.body)
      // Get pagination data from the request body
      const { page = 1 } = req.body; // Get page number from the body, default to 1
      const limit = page === 1 ? 9 : 8; // First page shows 9 news, subsequent pages show 8
      const skip = (page - 1) * limit; // Calculate the number of news to skip

      // Fetch news from the database
      const news = await VideoNews
        .find({ status: "Active" }) // Only active news
        .sort({ date: -1 }) // Sort by date (descending)
        .skip(skip) // Skip the necessary number of items based on page
        .limit(limit); // Limit to the page's number of items

      // Get the total count of active news for pagination info
      const totalNews = await VideoNews.count({ status: "Active" });

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalNews / (page === 1 ? 9 : 8));

      // Send response with the news data and pagination info
      return res.json({
        status: "success",
        message: "News fetched successfully!",
        news,
        pagination: {
          currentPage: page,
          totalPages,
          totalNews,
        },
      });
    } catch (err) {
      console.error("🚨 Error fetching paginated news:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
        error: err.message,
      });
    }
  },
};
