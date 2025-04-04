let Polls = require("../models/polls");

module.exports = {
  addPolls: async function (req, res) {
    try {
      const { question, correctAnswerIndex } = req.body;
      let options = req.body.options;

      // Ensure options is an array
      if (typeof options === "string") {
        try {
          options = JSON.parse(options);
        } catch (error) {
          return res.json({
            status: "error",
            message: "Invalid options format.",
          });
        }
      }

      // Validate options
      if (!Array.isArray(options) || options.length !== 4) {
        return res.json({
          status: "error",
          message: "Please provide exactly 4 options as an array.",
        });
      }

      // Validate correctAnswerIndex
      if (
        typeof correctAnswerIndex === "undefined" ||
        correctAnswerIndex === ""
      ) {
        return res.json({
          status: "error",
          message: "correctAnswerIndex is required.",
        });
      }

      const newPoll = new Polls({
        question,
        options,
        correctAnswerIndex,
      });

      await newPoll.save();

      res.json({ status: "success", message: "Poll added successfully!" });
    } catch (error) {
      console.error("Error storing poll:", error);
      res.json({ status: "error", message: "Internal server error." });
    }
  },

  getPolls: async function (req, res) {
    try {
      // Retrieve all polls
      const polls = await Polls.find();

      // Map each poll to include totalVotes and formatted options
      const formattedPolls = polls.map((poll) => {
        // Calculate total votes for the poll
        const totalVotes = poll.options.reduce(
          (sum, option) => sum + option.votes,
          0
        );

        // Format each option with its vote count and percentage (if any votes exist)
        const formattedOptions = poll.options.map((option) => ({
          text: option.text,
          votes: option.votes,
          percentage:
            totalVotes > 0
              ? ((option.votes / totalVotes) * 100).toFixed(2)
              : "0.00",
        }));

        return {
          _id: poll._id,
          question: poll.question,
          options: formattedOptions,
          correctAnswerIndex: poll.correctAnswerIndex,
          totalVotes: totalVotes,
        };
      });

      // Return the polls with additional vote information
      res.json({ polls: formattedPolls });
    } catch (err) {
      console.error("Error fetching polls:", err);
      res.status(500).json({ error: err.message });
    }
  },

  //     submitPoll: async function(req, res) {
  //       try {
  //           console.log('🔹 Request received:', req.body);

  //           const { responses } = req.body;
  //           if (!Array.isArray(responses) || responses.length === 0) {
  //               console.log('❌ Invalid request format');
  //               return res.status(400).json({ status: 'error', message: 'Responses array is required.' });
  //           }

  //           const updatedPolls = [];

  //           for (const response of responses) {
  //               const { id, optionIndex } = response;

  //               if (!id || optionIndex === undefined) {
  //                   console.log('❌ Missing ID or option index in response:', response);
  //                   return res.status(400).json({ status: 'error', message: 'Poll ID and option index are required.' });
  //               }

  //               console.log('🔹 Finding poll with ID:', id);
  //               const poll = await Polls.findById(id);
  //               if (!poll) {
  //                   console.log('❌ Poll not found for ID:', id);
  //                   return res.status(404).json({ status: 'error', message: `Poll with ID ${id} not found.` });
  //               }

  //               console.log('🔹 Poll found:', poll);
  //               if (optionIndex < 0 || optionIndex >= poll.options.length) {
  //                   console.log('❌ Invalid option index:', optionIndex);
  //                   return res.status(400).json({ status: 'error', message: 'Invalid option index.' });
  //               }

  //               console.log('🔹 Voting for option index:', optionIndex);
  //               poll.options[optionIndex].votes += 1;
  //               await poll.save();

  //               // Format the response with vote counts
  //               updatedPolls.push({
  //                   _id: poll._id,
  //                   question: poll.question,
  //                   options: poll.options.map(option => ({
  //                       text: option.text,
  //                       votes: option.votes
  //                   })),
  //                   correctAnswerIndex: poll.correctAnswerIndex,
  //                   totalVotes: poll.options.reduce((sum, option) => sum + option.votes, 0) // Total votes for this poll
  //               });
  //           }

  //           console.log('✅ Votes submitted successfully:', updatedPolls);
  //           return res.json({
  //               status: 'success',
  //               message: 'Votes submitted successfully!',
  //               polls: updatedPolls
  //           });

  //       } catch (err) {
  //           console.error('🚨 Error submitting poll:', err);
  //           return res.status(500).json({ status: 'error', message: 'Internal server error.', error: err.message });
  //       }
  //   },

  submitPoll: async function (req, res) {
    try {
      console.log("🔹 Request received:", req.body);

      const { id, optionIndex } = req.body;

      // Validate
      if (!id || optionIndex === undefined) {
        return res.status(400).json({
          status: "error",
          message: "Poll ID and option index are required.",
        });
      }

      console.log("🔹 Finding poll with ID:", id);
      const poll = await Polls.findById(id);
      if (!poll) {
        return res.status(404).json({
          status: "error",
          message: `Poll with ID ${id} not found.`,
        });
      }

      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        return res.status(400).json({
          status: "error",
          message: "Invalid option index.",
        });
      }

      // ✅ Vote for the selected option
      poll.options[optionIndex].votes += 1;
      await poll.save();

      // ✅ Calculate total votes
      const totalVotes = poll.options.reduce(
        (sum, option) => sum + option.votes,
        0
      );

      // ✅ Return updated poll with percentages
      const updatedPoll = {
        _id: poll._id,
        question: poll.question,
        options: poll.options.map((option) => ({
          text: option.text,
          votes: option.votes,
          percentage:
            totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(2) : 0,
        })),
        correctAnswerIndex: poll.correctAnswerIndex,
        totalVotes,
      };

      console.log("✅ Vote submitted successfully:", updatedPoll);
      return res.json({
        status: "success",
        message: "Vote submitted successfully!",
        poll: updatedPoll,
      });
    } catch (err) {
      console.error("🚨 Error submitting poll:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
        error: err.message,
      });
    }
  },

  deletePoll: async function (req, res) {
    try {
      const { id } = req.params;

      // Check if ID is valid before querying
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid poll ID." });
      }

      // Check if the poll exists
      const poll = await Polls.findById(id);
      if (!poll) {
        return res
          .status(404)
          .json({ status: "error", message: "Poll not found." });
      }

      // Delete the poll
      await Polls.deleteOne({ _id: id });

      res.json({ status: "success", message: "Poll deleted successfully!" });
    } catch (error) {
      console.error("Error deleting poll:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal server error." });
    }
  },

  getPollById: async function (req, res) {
    try {
      const poll = await Polls.findById(req.params.id);
      if (!poll) {
        return res
          .status(404)
          .json({ status: "error", message: "Poll not found" });
      }
      res.json(poll);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  },

  updatePoll: async function (req, res) {
    try {
      const { question, options, correctAnswerIndex } = req.body;
      const pollId = req.params.id; // Get poll ID from URL

      if (
        !question ||
        !options ||
        options.length < 2 ||
        correctAnswerIndex === ""
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid data" });
      }

      const poll = await Polls.findByIdAndUpdate(
        pollId,
        { question, options, correctAnswerIndex },
        { new: true }
      );

      if (!poll) {
        return res
          .status(404)
          .json({ status: "error", message: "Poll not found" });
      }

      res.json({
        status: "success",
        message: "Poll updated successfully",
        poll,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  },
};
