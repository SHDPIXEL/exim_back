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
      const polls = await Polls.find();
      res.json(polls);
    } catch (err) {
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

      const { responses } = req.body;
      if (!Array.isArray(responses) || responses.length === 0) {
        console.log("❌ Invalid request format");
        return res
          .status(400)
          .json({ status: "error", message: "Responses array is required." });
      }

      const updatedPolls = [];

      for (const response of responses) {
        const { id, optionIndex } = response;

        if (!id || optionIndex === undefined) {
          console.log("❌ Missing ID or option index in response:", response);
          return res
            .status(400)
            .json({
              status: "error",
              message: "Poll ID and option index are required.",
            });
        }

        console.log("🔹 Finding poll with ID:", id);
        const poll = await Polls.findById(id);
        if (!poll) {
          console.log("❌ Poll not found for ID:", id);
          return res
            .status(404)
            .json({
              status: "error",
              message: `Poll with ID ${id} not found.`,
            });
        }

        console.log("🔹 Poll found:", poll);
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
          console.log("❌ Invalid option index:", optionIndex);
          return res
            .status(400)
            .json({ status: "error", message: "Invalid option index." });
        }

        console.log("🔹 Voting for option index:", optionIndex);
        poll.options[optionIndex].votes += 1;
        await poll.save();

        // Calculate total votes for the poll
        const totalVotes = poll.options.reduce(
          (sum, option) => sum + option.votes,
          0
        );

        // Format the response with vote counts and percentages
        updatedPolls.push({
          _id: poll._id,
          question: poll.question,
          options: poll.options.map((option) => ({
            text: option.text,
            votes: option.votes,
            percentage:
              totalVotes > 0
                ? ((option.votes / totalVotes) * 100).toFixed(2)
                : 0, // Calculate percentage
          })),
          correctAnswerIndex: poll.correctAnswerIndex,
          totalVotes: totalVotes, // Total votes for this poll
        });
      }

      console.log("✅ Votes submitted successfully:", updatedPolls);
      return res.json({
        status: "success",
        message: "Votes submitted successfully!",
        polls: updatedPolls,
      });
    } catch (err) {
      console.error("🚨 Error submitting poll:", err);
      return res
        .status(500)
        .json({
          status: "error",
          message: "Internal server error.",
          error: err.message,
        });
    }
  },
};
