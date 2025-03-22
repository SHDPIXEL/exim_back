const express = require("express");
const router = express.Router();
const fs = require("fs");
const moment = require("moment"); // Import moment.js for formatting
const jwt = require("jsonwebtoken");

// Bring in Digital Copy Model
let DigitalCopy = require("../models/digitalCopy");
// Bring in Log Model
let Log = require("../models/log");
//payment
let Payment = require("../models/payments");

module.exports = {
  // Digital Copies List Start
  list: function (req, res) {
    res.render("digital_copies/list_digital_copy");
  },
  // Digital Copies List End

  // Get Digital Copies Data Start
  get_digital_copies: function (req, res) {
    var col = req.body.columns[req.body.order[0].column].data;
    var order = req.body.order[0].dir;
    var status_search = req.body.columns[4].search.value; // ✅ Status filter
    var location_search = req.body.columns[5].search.value; // ✅ Location filter

    if (order == "asc") {
      order = 1;
    } else {
      order = -1;
    }
    column_order = { [col]: order };

    status_search = status_search ? { status: status_search } : {}; // ✅ Status condition
    location_search = location_search ? { location: location_search } : {}; // ✅ Location condition

    var common_search = req.body.search.value
      ? {
          $or: [
            { name: { $regex: req.body.search.value, $options: "i" } },
            { url: { $regex: req.body.search.value, $options: "i" } },
          ],
        }
      : {};

    var searchStr = { $and: [common_search, status_search, location_search] }; // ✅ Includes all conditions

    var recordsTotal = 0;
    var recordsFiltered = 0;

    DigitalCopy.count({}, function (err, c) {
      recordsTotal = c;
      DigitalCopy.count(searchStr, function (err, c) {
        recordsFiltered = c;
        DigitalCopy.find(
			searchStr,
			"_id name url image status date location",
			{
			  skip: Number(req.body.start),
			  limit: req.body.length != -1 ? Number(req.body.length) : c,
			},
			function (err, results) {
			  if (err) {
				console.log("Error while getting results:", err);
				return;
			  }
		  
			  results = results.map((record) => ({
				...record._doc,
				dateISO: record.date || null, // ✅ Keeps the stored string format (YYYY-MM-DD)
				dateFormatted: record.date
				  ? moment(record.date, "YYYY-MM-DD").format("DD-MM-YYYY") // ✅ Format string correctly
				  : "N/A",
				location: record.location || "Not Specified", // ✅ Handles missing locations
			  }));
		  
			  res.send(
				JSON.stringify({
				  draw: req.body.draw,
				  recordsFiltered: recordsFiltered,
				  recordsTotal: recordsTotal,
				  data: results,
				})
			  );
			}
		  ).sort(column_order);		  
      });
    });
  },

  // Get Digital Copies Data End

  getDigitalCopiesByDate: async function (req, res) {
    try {
      console.log("token", req.headers.authorization?.split(" ")[1]);
      // Extract userId from the token
      const token = req.headers.authorization?.split(" ")[1]; 
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }
      console.log("TOKENNNN", token);

      // Decode without verification (to check exp, payload, etc.)
      const decodedPayload = jwt.decode(token, { complete: true });
      console.log("Decoded Payload (No Verify):", decodedPayload);

      // Check expiration time
      if (decodedPayload?.payload?.exp) {
        const expirationDate = new Date(decodedPayload.payload.exp * 1000);
        console.log(
          "Token Expiry:",
          expirationDate,
          "Current Time:",
          new Date()
        );
      }

      let decoded;
      try {
        // Verify the token
        decoded = jwt.verify(token.trim(), process.env.SECRET_KEY);
        console.log("Decoded After Verification:", decoded);
      } catch (err) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }
      console.log("decoded", decoded);

      const userId = decoded.userId; // Extract userId from token payload
      console.log("useriD", userId);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid user" });
      }

      console.log("body data", req.body);

      // Get location and date from request body
      const { location, date } = req.body;

      if (!location || !date) {
        return res
          .status(400)
          .json({ success: false, message: "Location and date are required" });
      }

      // Check if the user has a valid subscription for the given location (WITHOUT expiry check)
      const userSubscription = await Payment.findOne({
        userId: userId,
        "subscription_details.location": location, // Only check if location is subscribed
        paymentStatus: "success", // Ensure payment was successful
      });

      console.log("check payment", userSubscription);

      if (!userSubscription) {
        return res.status(403).json({
          success: false,
          message: "No valid subscription found for this location",
        });
      }

      console.log("user subscription found but not digital copies in the db");

      // Find all digital copies for that location and date
      const digitalCopies = await DigitalCopy.find({
        location: location,
        date: date,
      });
      console.log("All digital copies for location:", digitalCopies);

      console.log("digital copies", digitalCopies);

      if (!digitalCopies.length) {
        return res.status(404).json({
          success: false,
          message: "No records found for this location and date",
        });
      }

      res.json({
        success: true,
        data: digitalCopies.map((record) => ({
          id: record._id,
          name: record.name,
          url: record.url,
          image: record.image,
          status: record.status,
          location: record.location,
		  dateISO: record.date || null, // ✅ Keeps the stored string format (YYYY-MM-DD)
		  dateFormatted: record.date
			? moment(record.date, "YYYY-MM-DD").format("DD-MM-YYYY") // ✅ Format string correctly
			: "N/A",
        })),
      });
    } catch (error) {
      console.error("Error fetching digital copies by date:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Digital Copy Add Form Start
  add: function (req, res) {
    res.render("digital_copies/add_digital_copy");
  },
  // Digital Copy Add Form End

  store: function (req, res) {
    const name = "Exim Digital Copy"; // Default name
    console.log("Received body:", req.body);
    console.log("Received date_added:", req.body.date_added); // Debugging

    const { url, status, location, date_added } = req.body;

    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Location is required." });
    }

    const image = req.file
      ? "https://eximback.demo.shdpixel.com/uploads/digital_copies/" +
        req.file.filename
      : "";

    let new_digital_copy = new DigitalCopy({
      name,
      url,
      status,
      image,
      date: date_added.toString(), // ✅ Convert to string explicitly
      location,
    });

    console.log("New digital copy:", new_digital_copy);

    new_digital_copy.save(function (err, savedRecord) {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Error saving record", error: err });
      }

      let new_log = new Log({
        user_id: req.user._id,
        message: "Add",
        table: "digital_copies",
      });

      new_log.save(function (err) {
        if (err) {
          console.log("Error saving log:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error saving log", error: err });
        }
      });

      console.log("Saved Date:", savedRecord.date);

      res.json({
        success: true,
        message: "Record Inserted Successfully",
        data: {
          id: savedRecord._id,
          name: savedRecord.name,
          url: savedRecord.url,
          status: savedRecord.status,
          image: savedRecord.image,
          location: savedRecord.location,
          date: savedRecord.date, // ✅ Already stored as YYYY-MM-DD
        },
      });
    });
  },

  // Digital Copy Store Data End

  // Digital Copy Edit Form Start
  edit: function (req, res) {
    DigitalCopy.findById(req.params.id, function (err, digital_copy) {
      if (digital_copy) {
        res.render("digital_copies/edit_digital_copy", {
          digital_copy: digital_copy,
        });
      }
    });
  },
  // Digital Copy Edit Form End

  // Digital Copy Update Data Start
  update: function (req, res) {
    let query = { _id: req.params.id };

    DigitalCopy.findById(req.params.id, function (err, digital_copy) {
      if (digital_copy) {
        digital_copy.name = req.body.name;
        digital_copy.url = req.body.url;
        digital_copy.status = req.body.status;
        if (req.file !== undefined) {
          if (digital_copy.image !== "") {
            var image = digital_copy.image.split("/");
            image = "./public/" + image[3] + "/" + image[4] + "/" + image[5];
            // console.log(image);
            fs.unlink(image, function (err) {
              if (err) {
                console.log(err);
              }
              // if no error, file has been deleted successfully
              console.log("File deleted!");
              return false;
            });
          }
          digital_copy.image =
            "https://eximback.demo.shdpixel.com/uploads/digital_copies/" +
            req.file.filename;
        }

        // console.log(digital_copys);return false;
        digital_copy.save(function (err) {
          if (err) {
            console.log(err);
            res.send("error|" + err);
          } else {
            let new_log = new Log({
              user_id: req.user._id,
              message: "Edit",
              table: "digital_copies",
            });

            new_log.save(function (err, user) {
              if (err) {
                console.log("err " + err);
                return res.send(err);
              }
            });
            res.send("success|Record Updated Successfully.");
          }
        });
      }
    });
  },
  // Digital Copy Update Data End

  // Digital Copy Delete Data Start
  delete: async function (req, res) {
    try {
      let query = { _id: req.params.id };

      // Find the document
      const digital_copy = await DigitalCopy.findById(req.params.id);
      if (!digital_copy) {
        return res
          .status(404)
          .json({ success: false, message: "Record not found." });
      }

      // Handle image deletion
      if (digital_copy.image && digital_copy.image !== "") {
        var imagePath = digital_copy.image.split("/");
        imagePath = `./${imagePath[3]}/${imagePath[4]}/${imagePath[5]}`;

        if (fs.existsSync(imagePath)) {
          try {
            await fs.promises.unlink(imagePath); // ✅ Use promises to wait for deletion
            console.log("File deleted successfully!");
          } catch (err) {
            console.log("File deletion error:", err);
          }
        } else {
          console.log("File does not exist:", imagePath);
        }
      }

      // Delete the record from the database
      await DigitalCopy.deleteOne(query);

      // Log the deletion
      let new_log = new Log({
        user_id: req.user._id,
        message: "Delete",
        table: "digital_copies",
      });

      await new_log.save();

      return res.json({
        success: true,
        message: "Record Deleted Successfully.",
      });
    } catch (err) {
      console.log("Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error deleting record", error: err });
    }
  },
  // Digital Copy Delete Data End
};
