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
    var order = req.body.order[0].dir === "asc" ? 1 : -1;
    var column_order = { [col]: order };

    // ✅ Improved filtering
    var status_search = req.body.columns[4].search.value
      ? { status: { $regex: req.body.columns[4].search.value, $options: "i" } }
      : {};

    var location_search = req.body.columns[5].search.value
      ? {
          location: { $regex: req.body.columns[5].search.value, $options: "i" },
        }
      : {};

    // ✅ Improved general search (now searches in name, url, location, status, and date)
    var common_search = req.body.search.value
      ? {
          $or: [
            { name: { $regex: req.body.search.value, $options: "i" } },
            { url: { $regex: req.body.search.value, $options: "i" } },
            { location: { $regex: req.body.search.value, $options: "i" } },
            { status: { $regex: req.body.search.value, $options: "i" } },
            { date: { $regex: req.body.search.value, $options: "i" } },
          ],
        }
      : {};

    // ✅ Combine all search filters
    var searchStr = { $and: [common_search, status_search, location_search] };

    DigitalCopy.count({}, function (err, totalRecords) {
      DigitalCopy.count(searchStr, function (err, filteredRecords) {
        DigitalCopy.find(
          searchStr,
          "_id name url image status date location",
          {
            skip: Number(req.body.start),
            limit:
              req.body.length != -1 ? Number(req.body.length) : filteredRecords,
            sort: column_order,
          },
          function (err, results) {
            if (err) {
              console.log("Error while getting results:", err);
              return;
            }

            results = results.map((record) => ({
              ...record._doc,
              dateISO: record.date || null,
              dateFormatted: record.date
                ? moment(record.date, "YYYY-MM-DD").format("DD-MM-YYYY")
                : "N/A",
              location: record.location || "Not Specified",
            }));

            res.json({
              draw: req.body.draw,
              recordsTotal: totalRecords,
              recordsFiltered: filteredRecords,
              data: results,
            });
          }
        );
      });
    });
  },

  // Get Digital Copies Data End

  getDigitalCopiesByDate: async function (req, res) {
    try {
      // 🛡️ Extract and verify token
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token.trim(), process.env.SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
      }
  
      const userId = decoded.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid user" });
      }
  
      console.log("User ID:", userId, "Body Data:", req.body);
  
      // 📍 Get location and date from request body
      const { location, date } = req.body;
  
      if (!location) {
        return res.status(400).json({ success: false, message: "Location is required" });
      }
  
      // 🔍 Check if the user has a valid subscription for the location
      const userSubscription = await Payment.findOne({
        userId: userId,
        "subscription_details.location": location,
        paymentStatus: "success",
      });
  
      if (!userSubscription) {
        return res.status(403).json({ success: false, message: `No valid subscription for ${location}` });
      }
  
      let filter = { location };
  
      if (date) {
        filter.date = date; // If date is provided, filter by date
      }
  
      // 📄 Fetch digital copies sorted by the latest date
      let digitalCopy = await DigitalCopy.findOne(filter).sort({ date: -1 });
  
      // If no record is found for the given date, fetch the most recent one for the location
      if (!digitalCopy && !date) {
        digitalCopy = await DigitalCopy.findOne({ location }).sort({ date: -1 });
      }
  
      if (!digitalCopy) {
        return res.status(404).json({
          success: false,
          message: `No digital copies found for ${location}${date ? ` on ${date}` : ""}`,
        });
      }
  
      // 🗂️ Transform response
      res.json({
        success: true,
        data: {
          id: digitalCopy._id,
          name: digitalCopy.name,
          url: digitalCopy.url,
          image: digitalCopy.image,
          status: digitalCopy.status,
          location: digitalCopy.location,
          dateISO: digitalCopy.date || null,
          dateFormatted: digitalCopy.date ? moment(digitalCopy.date, "YYYY-MM-DD").format("DD-MM-YYYY") : "N/A",
        },
      });
    } catch (error) {
      console.error("Error fetching digital copies by date:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
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
