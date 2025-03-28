const express = require("express");
const router = express.Router();

// Bring in Appointment Model
let Appointment = require("../models/appointment");
// Bring in Job Title Model
let JobTitle = require("../models/appointmentJobTitle");
// Bring in Edition Model
let Edition = require("../models/appointmentEdition");
// Bring in Log Model
let Log = require("../models/log");

module.exports = {
  // Appointments List Start
  list: function (req, res) {
    res.render("appointments/list_appointment");
  },
  // Appointments List End

  // Get Appointments Data Start
  get_appointments: function (req, res) {
    var col = req.body.columns[req.body.order[0].column].data;
    var order = req.body.order[0].dir;
    var job_title_search = req.body.columns[1].search.value;
    var edition_search = req.body.columns[2].search.value;
    var date_search = req.body.columns[3].search.value;
    var status_search = req.body.columns[4].search.value;
    if (order == "asc") {
      order = 1;
    } else {
      order = -1;
    }
    column_order = { [col]: order };

    if (job_title_search) {
      job_title_search = { $or: [{ job_title_id: job_title_search }] };
    } else {
      job_title_search = {};
    }

    if (edition_search) {
      edition_search = { $or: [{ edition_id: edition_search }] };
    } else {
      edition_search = {};
    }

    if (date_search) {
      date_search = { $or: [{ date: date_search }] };
    } else {
      date_search = {};
    }

    if (status_search) {
      status_search = { $or: [{ status: status_search }] };
    } else {
      status_search = {};
    }

    /*if(req.body.search.value)
	    {
	    	var common_search = { $or: [{"job_title_id.job_title": { "$regex": req.body.search.value, "$options": "i" }},
	      						   { "edition_id.edition": { "$regex": req.body.search.value, "$options": "i" }}
	      						   ]};
	    }
	    else
	    {
	      common_search = {};
	    }*/
    var searchStr = {
      $and: [job_title_search, edition_search, date_search, status_search],
    };
    var recordsTotal = 0;
    var recordsFiltered = 0;

    Appointment.count({}, function (err, c) {
      recordsTotal = c;
      Appointment.count(searchStr, function (err, c) {
        recordsFiltered = c;
        Appointment.find(
          searchStr,
          "_id job_title_id.job_title edition_id.edition date status",
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
        )
          .sort(column_order)
          .populate("job_title_id", "job_title")
          .populate("edition_id", "edition");
      });
    });
  },
  // Get Appointments Data End

  get_appointments_website: async function (req, res) {
    try {
      if (!req.body.order || !req.body.order.length || !req.body.columns) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request format" });
      }

      const colIndex = req.body.order[0]?.column;
      if (colIndex === undefined || !req.body.columns[colIndex]) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid column index" });
      }

      const col = req.body.columns[colIndex].data;
      let order = req.body.order[0].dir === "asc" ? 1 : -1;
      let column_order = { [col]: order };

      let job_title_search = req.body.columns[1]?.search?.value || "";
      let edition_search = req.body.columns[2]?.search?.value || "";
      let date_search = req.body.columns[3]?.search?.value || "";
      let status_search = req.body.columns[4]?.search?.value || "";

      let searchStr = { $and: [] };
      if (job_title_search)
        searchStr.$and.push({ job_title_id: job_title_search });
      if (edition_search) searchStr.$and.push({ edition_id: edition_search });
      if (date_search) searchStr.$and.push({ date: date_search });
      if (status_search) searchStr.$and.push({ status: status_search });

      if (searchStr.$and.length === 0) searchStr = {};

      const page = parseInt(req.body.page) || 1; // Default to page 1
      const limit = 25; // Set limit to 25
      const skip = (page - 1) * limit;

      const recordsTotal = await Appointment.count();
      const recordsFiltered = await Appointment.count(searchStr);

      const results = await Appointment.find(searchStr)
        .skip(skip)
        .limit(limit)
        .sort(column_order)
        .populate("job_title_id", "job_title")
        .populate("edition_id", "edition");

      res.json({
        draw: req.body.draw || 1,
        recordsFiltered,
        recordsTotal,
        currentPage: page,
        totalPages: Math.ceil(recordsFiltered / limit),
        data: results,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  get_allappointments: async function (req, res) {
    try {
      const page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
      const limit = 5; // Limit results per page
      const skip = (page - 1) * limit;
      const column_order = req.body.sort || { createdAt: -1 }; // Default sorting
      const searchStr = req.body.search || {}; // Searching filter

      // Fetch total appointments count
      const totalAppointments = await Appointment.count(searchStr);

      // Fetch paginated appointments with populated job_title and edition fields
      const appointments = await Appointment.find(searchStr)
        .skip(skip)
        .limit(limit)
        .sort(column_order)
        .populate({
          path: "job_title_id",
          select: "job_title",
        })
        .populate({
          path: "edition_id",
          select: "edition",
        });

      // Transform the response to return job_title and edition directly
      const transformedAppointments = appointments.map((appointment) => ({
        ...appointment.toObject(),
        job_title: appointment.job_title_id?.job_title || "N/A",
        edition: appointment.edition_id?.edition || "N/A",
      }));

      return res.status(200).json({
        success: true,
        message: "Appointments retrieved successfully",
        appointments: transformedAppointments,
        totalPages: Math.ceil(totalAppointments / limit),
        currentPage: page,
        totalAppointments,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  search_appointments: async function (req, res) {
    try {
      console.log("req appointments", req.body);
  
      const page = parseInt(req.body.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
      const column_order = req.body.sort || { createdAt: -1 };
  
      let { edition, query } = req.body;
      let filter = {};
  
      // 🔹 Search job titles if query is provided
      if (query) {
        // Search for matching job titles in AppointmentJobTitle collection
        const matchingJobTitles = await JobTitle.find({
          job_title: { $regex: query, $options: "i" }, // Case-insensitive search
        }).select("_id");
  
        const jobTitleIds = matchingJobTitles.map((job) => job._id);
        if (jobTitleIds.length > 0) {
          filter["job_title_id"] = { $in: jobTitleIds }; // Filter appointments by matching job title
        } else {
          // If no job titles found, return empty result set
          return res.status(200).json({
            success: true,
            message: "No matching job titles found",
            appointments: [],
            totalPages: 0,
            currentPage: page,
            totalAppointments: 0,
          });
        }
      }
  
      // 🔹 Filter by Matching Edition IDs (Optional)
      if (edition) {
        const matchingEditions = await Edition.find({
          edition: { $regex: edition, $options: "i" },
        }).select("_id");
  
        const editionIds = matchingEditions.map((ed) => ed._id);
        if (editionIds.length > 0) {
          filter["edition_id"] = { $in: editionIds };
        }
      }
  
      // 🔄 Fetch filtered appointments count
      const totalAppointments = await Appointment.count(filter);
  
      // 📝 Fetch filtered appointments with job title
      const appointments = await Appointment.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(column_order)
        .populate({ path: "edition_id", select: "edition" }) // Fetch edition name
        .populate({ path: "job_title_id", select: "job_title" }); // Fetch job title ✅ FIXED
  
      // Transform response to include job title
      const transformedAppointments = appointments.map((appointment) => ({
        ...appointment.toObject(),
        edition: appointment.edition_id?.edition || "N/A",
        job_title: appointment.job_title_id?.job_title || "N/A", // ✅ FIXED
      }));
  
      console.log("search data", transformedAppointments);
  
      res.status(200).json({
        success: true,
        message: "Appointments retrieved successfully",
        appointments: transformedAppointments,
        totalPages: Math.ceil(totalAppointments / limit),
        currentPage: page,
        totalAppointments,
      });
    } catch (error) {
      console.error("Search Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  

  getLatestAppointments: async function (req, res) {
    try {
      // Fetch all editions
      const editions = await Edition.find();

      const latestAppointments = await Promise.all(
        editions.map(async (edition) => {
          // Find the latest appointment for the current edition
          const latestAppointment = await Appointment.findOne({
            edition_id: edition._id,
          })
            .sort({ date: -1 }) // Get the most recent appointment
            .populate("job_title_id", "job_title") // Populate job title
            .lean(); // Convert Mongoose document to a plain object

          return {
            edition: edition.edition,
            job_title: latestAppointment?.job_title_id?.job_title || null,
            date: latestAppointment?.date || null,
            description: latestAppointment?.description || null,
            status: latestAppointment?.status || null,
          };
        })
      );

      res.status(200).json({ appointments: latestAppointments });
    } catch (error) {
      console.error("Error fetching latest appointments:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Appointment Add Form Start
  add: function (req, res) {
    JobTitle.find({ status: "1" }, function (err, job_titles) {
      Edition.find({ status: "1" }, function (err, editions) {
        if (job_titles && editions) {
          res.render("appointments/add_appointment", {
            job_titles: job_titles,
            editions: editions,
          });
        }
      });
    });
  },
  // Appointment Add Form End

  // Appointment Store Data Start
  store: function (req, res) {
    const job_title_id = req.body.job_title_id;
    const edition_id = req.body.edition_id;
    const date = req.body.date;
    const description = req.body.description;
    const status = req.body.status;

    if (job_title_id != "") {
      job_title_id.map(function (val, ind) {
        let new_appointment = new Appointment({
          job_title_id: val,
          edition_id: edition_id,
          date: date,
          description: description,
          status: status,
        });
        new_appointment.save(function (err) {
          if (err) {
            console.log(err);
            // res.send('error|'+err);
          }
        });
      });
      let new_log = new Log({
        user_id: req.user._id,
        message: "Add",
        table: "appointments",
      });

      new_log.save(function (err, user) {
        if (err) {
          console.log("err " + err);
          return res.send(err);
        }
      });
      res.send("success|Record Inserted Successfully.");
    }
  },
  // Appointment Store Data End

  // Appointment Edit Form Start
  edit: function (req, res) {
    Appointment.findById(req.params.id, function (err, appointment) {
      JobTitle.find({ status: "1" }, function (err, job_titles) {
        Edition.find({ status: "1" }, function (err, editions) {
          if (appointment && job_titles && editions) {
            res.render("appointments/edit_appointment", {
              appointment: appointment,
              job_titles: job_titles,
              editions: editions,
            });
          }
        });
      });
    });
  },
  // Appointment Edit Form End

  // Appointment Update Data Start
  update: function (req, res) {
    let query = { _id: req.params.id };

    let appointment = {};
    // appointment.job_title_id = req.body.job_title_id;
    appointment.edition_id = req.body.edition_id;
    appointment.date = req.body.date;
    appointment.description = req.body.description;
    appointment.status = req.body.status;
    Appointment.update(query, appointment, function (err) {
      if (err) {
        console.log(err);
        res.send("error|" + err);
      } else {
        let new_log = new Log({
          user_id: req.user._id,
          message: "Edit",
          table: "appointments",
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
  },
  // Appointment Update Data End

  // Appointment Delete Data Start
  delete: function (req, res) {
    let query = { _id: req.params.id };
    Appointment.findById(req.params.id, function (err, appointment) {
      if (appointment) {
        Appointment.remove(query, function (err) {
          if (err) {
            console.log(err);
            res.send("error|" + err);
          } else {
            let new_log = new Log({
              user_id: req.user._id,
              message: "Delete",
              table: "appointments",
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
  // Appointment Delete Data End

  // Fetch Appointments Data Start
  /*fetch_appointments: function(req, res) {
		appointment.find({}, function(err, appointments) {
			if(appointments) {
				res.send(appointments);
			}
		})
	}*/
  // Fetch Appointments Data End
};
