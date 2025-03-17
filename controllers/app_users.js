const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Bring in App User Model
let AppUser = require("../models/appUser");
// Bring in Log Model
let Log = require("../models/log");
let Payments = require("../models/payments");

module.exports = {
  // App Users List Start
  list: function (req, res) {
    res.render("app_users/list_app_user");
  },
  // App Users List End
  //   addfeilds: async function (req, res) {
  //     try {
  //       const result = await AppUser.updateMany(
  //         {},
  //         {
  //           $set: {
  //             contact_person: "",
  //             contact_person_designation: "",
  //             company_address: "",
  //             city: "",
  //             pincode: "",
  //             state: "",
  //             country: "",
  //             password: "",
  //             confirm_password: "",
  //           },
  //         }
  //       );

  //       console.log(`Updated ${result.modifiedCount} users.`);
  //       return res.json({
  //         success: true,
  //         message: `${result.modifiedCount} users updated.`,
  //       });
  //     } catch (error) {
  //       console.error("Error updating documents:", error);
  //       return res
  //         .status(500)
  //         .json({ success: false, message: "Internal server error", error });
  //     }
  //   },

  // Get App Users Data Start
  get_app_users: function (req, res) {
    var col = req.body.columns[req.body.order[0].column].data;
    var order = req.body.order[0].dir;
    var subscribe_newsletter_search = req.body.columns[6].search.value;
    var date_search = req.body.columns[7].search.value;

    if (order == "asc") {
      order = 1;
    } else {
      order = -1;
    }
    column_order = { [col]: order };

    if (subscribe_newsletter_search) {
      subscribe_newsletter_search = {
        $or: [{ subscribe_newsletter: subscribe_newsletter_search }],
      };
    } else {
      subscribe_newsletter_search = {};
    }

    if (date_search) {
      date_search = {
        $or: [
          {
            $where:
              'this.updatedAt.toJSON().slice(0, 10) == "' + date_search + '"',
          },
        ],
      };
    } else {
      date_search = {};
    }

    if (req.body.search.value) {
      var common_search = {
        $or: [
          { name: { $regex: req.body.search.value, $options: "i" } },
          { company_name: { $regex: req.body.search.value, $options: "i" } },
          { email: { $regex: req.body.search.value, $options: "i" } },
          { mobile: { $regex: req.body.search.value, $options: "i" } },
          { nature_business: { $regex: req.body.search.value, $options: "i" } },
        ],
      };
    } else {
      common_search = {};
    }

    var searchStr = {
      $and: [common_search, subscribe_newsletter_search, date_search],
    };

    var recordsTotal = 0;
    var recordsFiltered = 0;

    AppUser.count({}, function (err, c) {
      recordsTotal = c;
      AppUser.count(searchStr, function (err, c) {
        recordsFiltered = c;
        AppUser.find(
          searchStr,
          "_id name company_name email mobile nature_business subscribe_newsletter updatedAt",
          {
            skip: Number(req.body.start),
            limit: req.body.length != -1 ? Number(req.body.length) : c,
          },
          function (err, results) {
            //{ "pop": (!isNaN(req.body.search.value)) ? Number(req.body.search.value) : 0}
            if (err) {
              console.log("error while getting results" + err);
              return;
            }

            var data = JSON.stringify({
              draw: req.body.draw,
              recordsFiltered: recordsFiltered,
              recordsTotal: recordsTotal,
              data: results,
            });
            res.send(data);
          }
        ).sort(column_order);
      });
    });
  },

  getUserDetails: async function (req, res) {
    try {
      console.log("token users", req.headers.authorization?.split(" ")[1]);

      // Extract token from headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ success: 0, message: "Unauthorized: Token missing." });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ success: 0, message: "Invalid token." });
      }

      const userId = decoded.userId;

      // Fetch user details
      const user = await AppUser.findById(userId).select(
        "-password -confirm_password"
      );

      if (!user) {
        return res.status(404).json({ success: 0, message: "User not found." });
      }

      // ✅ Format login history in descending order (latest login first)
      const formattedLoginHistory = user.login_history
        .map((entry) => ({
          timestamp: moment(entry.timestamp).format("MMMM D, YYYY, h:mm A"),
          ip: entry.ip,
          country: entry.country,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort in descending order

      // Fetch all payments with paymentStatus "success"
      const payments = await Payments.find({
        userId,
        paymentStatus: "success",
      });

      // Extract subscription locations with expiry dates
      const subscriptionLocations = payments.flatMap((payment) => {
        if (
          !payment.subscription_details ||
          !Array.isArray(payment.subscription_details)
        ) {
          return [];
        }

        return payment.subscription_details
          .map((sub) => {
            if (!sub.location) return null;

            let expiryDate = null;
            if (sub.duration) {
              const durationMatch = sub.duration.match(/(\d+)\s*year/);
              if (durationMatch) {
                const durationYears = parseInt(durationMatch[1], 10);
                expiryDate = new Date(payment.createdAt);
                expiryDate.setFullYear(
                  expiryDate.getFullYear() + durationYears
                );
                expiryDate = expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
              }
            }

            return {
              location: sub.location,
              expiry_date: expiryDate,
            };
          })
          .filter(Boolean); // Remove null values
      });

      return res.status(200).json({
        success: 1,
        message: "User details retrieved successfully.",
        user: {
          id: user._id,
          name: user.name,
          company_name: user.company_name,
          email: user.email,
          mobile: user.mobile,
          nature_business: user.nature_business,
          subscribe_newsletter: user.subscribe_newsletter,
          contact_person: user.contact_person,
          contact_person_designation: user.contact_person_designation,
          company_address: user.company_address,
          city: user.city,
          pincode: user.pincode,
          state: user.state,
          country: user.country,
          createdAt: user.createdAt,
          login_history: formattedLoginHistory, // ✅ Include formatted login history
        },
        subscription_locations: subscriptionLocations, // Send locations with expiry dates
      });
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get App Users Data End

  // App User Delete Data Start
  delete: function (req, res) {
    let query = { _id: req.params.id };
    // console.log(req.params.id);
    AppUser.findById(req.params.id, function (err, user) {
      if (user) {
        // console.log(query);
        AppUser.remove(query, function (err) {
          if (err) {
            console.log(err);
            res.send("error|" + err);
          } else {
            let new_log = new Log({
              user_id: req.user._id,
              message: "Delete",
              table: "app_users",
            });

            new_log.save(function (err, user) {
              if (err) {
                console.log("err " + err);
                return res.send(err);
              }
            });
            res.send("success|Record Deleted Successfully.");
          }
        });
      }
    });
  },
  // App User Delete Data End
};
