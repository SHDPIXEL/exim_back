const express = require("express");
const router = express.Router();

// Bring in Event Category Model
let EventCategory = require("../models/eventCategory");
// Bring in Log Model
let Log = require("../models/log");

module.exports = {
  // Event Categories List Start
  list: function (req, res) {
    res.render("event_categories/list_event_category");
  },
  // Event Categories List End

  // Get Event Categories Data Start
  get_event_categories: function (req, res) {
    var col = req.body.columns[req.body.order[0].column].data;
    var order = req.body.order[0].dir;
    var status_search = req.body.columns[2].search.value;
    if (order == "asc") {
      order = 1;
    } else {
      order = -1;
    }
    column_order = { [col]: order };

    if (status_search) {
      status_search = { $or: [{ status: status_search }] };
    } else {
      status_search = {};
    }

    if (req.body.search.value) {
      var common_search = {
        $or: [{ category: { $regex: req.body.search.value, $options: "i" } }],
      };
    } else {
      common_search = {};
    }
    var searchStr = { $and: [common_search, status_search] };
    var recordsTotal = 0;
    var recordsFiltered = 0;

    EventCategory.count({}, function (err, c) {
      recordsTotal = c;
      EventCategory.count(searchStr, function (err, c) {
        recordsFiltered = c;
        EventCategory.find(
          searchStr,
          "_id category status",
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
  // Get Event Categories Data End

  get_event_categories_website: function (req, res) {
    try {
      const orderIndex = req.body.order?.[0]?.column;
      const col = req.body.columns?.[orderIndex]?.data || "category";
      const orderDirection = req.body.order?.[0]?.dir === "asc" ? 1 : -1;
      const column_order = { [col]: orderDirection };
  
      const statusValue = req.body.columns?.[2]?.search?.value;
      const status_search = statusValue ? { status: statusValue } : {};
  
      const searchValue = req.body.search?.value;
      const common_search = searchValue
        ? { category: { $regex: searchValue, $options: "i" } }
        : {};
  
      const searchStr = { $and: [common_search, status_search] };
  
      let recordsTotal = 0;
      let recordsFiltered = 0;
  
      EventCategory.count({})
        .then((total) => {
          recordsTotal = total;
          return EventCategory.count(searchStr);
        })
        .then((filtered) => {
          recordsFiltered = filtered;
          return EventCategory.find(searchStr, "_id category") // 👈 Only _id and category
            .skip(Number(req.body.start) || 0)
            .limit(
              req.body.length != -1 ? Number(req.body.length) : recordsFiltered
            )
            .sort(column_order)
            .lean();
        })
        .then((results) => {
          res.status(200).json({
            draw: req.body.draw || 0,
            recordsFiltered,
            recordsTotal,
            data: results.map(item => ({
              _id: item._id,
              category: item.category
            }))
          });
        })
        .catch((err) => {
          console.error("Error fetching event categories:", err);
          res.status(500).json({ error: "Internal server error" });
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },  

  // Event Category Add Form Start
  add: function (req, res) {
    res.render("event_categories/add_event_category");
  },
  // Event Category Add Form End

  // Event Category Store Data Start
  store: function (req, res) {
    const category = req.body.event_category;
    const status = req.body.status;
    // console.log(req.body);return false;
    EventCategory.findOne(
      { category: category },
      function (err, event_category) {
        if (err) {
          console.log("finone " + err);
          res.send("error|" + err);
        }
        if (event_category) {
          res.send("error|Event Category Already Exist.");
        } else {
          let new_event_category = new EventCategory({
            category: category,
            status: status,
          });

          new_event_category.save(function (err) {
            if (err) {
              console.log(err);
              res.send("error|" + err);
            } else {
              let new_log = new Log({
                user_id: req.user._id,
                message: "Add",
                table: "event_categories",
              });

              new_log.save(function (err, user) {
                if (err) {
                  console.log("err " + err);
                  return res.send(err);
                }
              });
              res.send("success|Record Inserted Successfully.");
            }
          });
        }
      }
    );
  },
  // Event Category Store Data End

  // Event Category Edit Form Start
  edit: function (req, res) {
    EventCategory.findById(req.params.id, function (err, event_category) {
      if (event_category) {
        res.render("event_categories/edit_event_category", {
          event_category: event_category,
        });
      }
    });
  },
  // Event Category Edit Form End

  // Event Category  Update Data Start
  update: function (req, res) {
    let query = { _id: req.params.id };

    EventCategory.findOne(
      {
        $and: [
          { category: req.body.event_category },
          { _id: { $ne: req.params.id } },
        ],
      },
      function (err, event_category) {
        if (err) {
          console.log("finone " + err);
          res.send("error|" + err);
        }
        if (event_category) {
          res.send("error|Event Category Already Exist.");
        } else {
          let event_category = {};
          event_category.category = req.body.event_category;
          event_category.status = req.body.status;
          EventCategory.update(query, event_category, function (err) {
            if (err) {
              console.log(err);
              res.send("error|" + err);
            } else {
              let new_log = new Log({
                user_id: req.user._id,
                message: "Edit",
                table: "event_categories",
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
      }
    );
  },
  // Event Category Update Data End

  // Event Category Delete Data Start
  delete: function (req, res) {
    let query = { _id: req.params.id };

    EventCategory.findById(req.params.id, function (err, event_category) {
      if (event_category) {
        EventCategory.remove(query, function (err) {
          if (err) {
            console.log(err);
            res.send("error|" + err);
          } else {
            let new_log = new Log({
              user_id: req.user._id,
              message: "Delete",
              table: "event_categories",
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
  // Event Category Delete Data End

  // Fetch Event Categories Data Start
  fetch_event_categories: function (req, res) {
    EventCategory.find({}, function (err, event_categories) {
      if (event_categories) {
        res.send(event_categories);
      }
    });
  },
  // Fetch Event Categories Data End
};
