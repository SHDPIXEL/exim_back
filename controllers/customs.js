const express = require("express");
const router = express.Router();
const sql = require("mssql");

sql.close();
// config for your database
var config = {
  user: "exim07",
  password: "Asiapacific@2021",
  // password: 'nFw10!k0',
  // server: '50.115.114.109',
  server: "103.21.58.193",
  database: "eximindia",
  // port: 1434
};

// connect to your database
sql.connect(config, function (err) {
  if (err) console.log(err);
});

// Bring in Customs Model
let Custom = require("../models/customs");
// Bring in Currency Model
let Currency = require("../models/currency");
// Bring in Log Model
let Log = require("../models/log");

module.exports = {
  // Customs List Start
  list: function (req, res) {
    res.render("customs/list_custom");
  },
  // Customs List End

  // Get Customs Data Start
  get_customs: function (req, res) {
    var col = req.body.columns[req.body.order[0].column].data;
    var order = req.body.order[0].dir;
    var date_search = req.body.columns[4].search.value;
    if (order == "asc") {
      order = 1;
    } else {
      order = -1;
    }
    column_order = { [col]: order };

    if (date_search) {
      date_search = { $or: [{ date: date_search }] };
    } else {
      date_search = {};
    }

    if (req.body.search.value) {
      var common_search = {
        $or: [
          { currency: { $regex: req.body.search.value, $options: "i" } },
          { import: { $regex: req.body.search.value, $options: "i" } },
          { export: { $regex: req.body.search.value, $options: "i" } },
          { notification_no: { $regex: req.body.search.value, $options: "i" } },
          { sql_id: { $regex: req.body.search.value, $options: "i" } },
        ],
      };
    } else {
      common_search = {};
    }
    var searchStr = { $and: [common_search, date_search] };
    var recordsTotal = 0;
    var recordsFiltered = 0;

    Custom.count({}, function (err, c) {
      recordsTotal = c;
      Custom.count(searchStr, function (err, c) {
        recordsFiltered = c;
        Custom.find(
          searchStr,
          "_id currency import export date notification_no sql_id",
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
            console.log("Results from DB:", results); // ✅ Add this log

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
  // Get Customs Data End

  // Customs Add Form Start
  add: function (req, res) {
    Currency.find({}, function (err, currencies) {
      if (err) {
        console.log("error", err);
        return res.send("error|" + err);
      }
      res.render("customs/add_custom", {
        currencies: currencies,
      });
    });
  },
  // Customs Add Form End

  store: async function (req, res) {
    try {
      const {
        currency,
        import: importt,
        export: exportt,
        date,
        notification_no,
      } = req.body;
      const request = new sql.Request();
      let count = 1;

      for (let i = 0; i < currency.length; i++) {
        const query = `
                INSERT INTO Custom_Rates (currency_name, import, export, upd_date, notification_no, currency_display, curr_id)
                VALUES ('${currency[i]}', '${importt[i]}', '${exportt[i]}', '${date}', '${notification_no}', 1, '${count}')
            `;

        await request.query(query);

        const { recordset } = await request.query("SELECT @@IDENTITY AS id");
        const sql_id = recordset[0].id;

        const new_custom = new Custom({
          currency: currency[i],
          import: importt[i],
          export: exportt[i],
          date: date,
          notification_no: notification_no,
          sql_id: sql_id,
        });

        await new_custom.save();

		const new_log = new Log({
			user_id: req.user ? req.user._id : null, // Avoids the error
			message: "Add",
			table: "customs",
		});
		

        await new_log.save();
        count++;
      }

      res.send("success|Record Inserted Successfully.");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("error|Something went wrong.");
    }
  },

  edit: async function (req, res) {
    try {
      const currencies = await Currency.find({});
      const custom = await Custom.findOne({ sql_id: req.params.id });

      if (!custom) {
        return res.status(404).send("Custom entry not found.");
      }

      res.render("customs/edit_custom", { custom, currencies });
    } catch (error) {
      console.error("Error fetching edit form:", error);
      res.status(500).send("Server error.");
    }
  },

  getCustomById: async function (req, res) {
    try {
      const { id } = req.params;

      // Fetch the specific record
      const custom = await Custom.findById(id);

      if (!custom) {
        return res.status(404).json({
          status: "error",
          message: "Custom entry not found",
        });
      }

      // Fetch all available currencies
      const currencies = await Currency.find({}, "currency");

      res.status(200).json({
        status: "success",
        data: custom, // The specific custom record
        currencies: currencies.map((c) => ({ currency: c.currency })), // Correct field name
      });
    } catch (error) {
      console.error("Error fetching custom entry:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  },

  updateCustomById: async function (req, res) {
    try {
      const { id } = req.params;
      const {
        currency,
        date,
        import: importValue,
        export: exportValue,
        notification_no,
      } = req.body;

      const updatedCustom = await Custom.findByIdAndUpdate(
        id,
        {
          currency,
          date,
          import: importValue,
          export: exportValue,
          notification_no,
        },
        { new: true, runValidators: true }
      );

      if (!updatedCustom) {
        return res
          .status(404)
          .json({ status: "error", message: "Custom entry not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Custom entry updated successfully",
        data: updatedCustom,
      });
    } catch (error) {
      console.error("Error updating custom entry:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  },

  // Custom Update Data Start
  update: function (req, res) {
    let query = { _id: req.params.id };

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
      "UPDATE Custom_Rates SET currency_name = '" +
        req.body.currency +
        "', import = '" +
        req.body.import +
        "', export = '" +
        req.body.export +
        "', upd_date = '" +
        req.body.date +
        "', notification_no = '" +
        req.body.notification_no +
        "' WHERE Id = " +
        req.params.id +
        "",
      function (err) {
        if (err) {
          console.log("Sql Error: " + err);
          return;
        }

        Custom.findOne({ sql_id: req.params.id }, function (err, custom) {
          if (custom) {
            custom.currency = req.body.currency;
            custom.import = req.body.import;
            custom.export = req.body.export;
            custom.date = req.body.date;
            custom.notification_no = req.body.notification_no;
            custom.save(function (err) {
              if (err) {
                console.log(err);
                res.send("error|" + err);
              } else {
                let new_log = new Log({
                  user_id: req.user._id,
                  message: "Edit",
                  table: "customs",
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
      }
    );
  },
  // Custom Update Data End

  // Custom Delete Data Start
  delete: function (req, res) {
    let query = { sql_id: req.params.id };

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
      "DELETE FROM Custom_Rates WHERE Id = " + req.params.id + "",
      function (err) {
        if (err) {
          console.log("Sql Error: " + err);
          return;
        }

        Custom.findOne({ sql_id: req.params.id }, function (err, custom) {
          if (custom) {
            Custom.remove(query, function (err) {
              if (err) {
                console.log(err);
                res.send("error|" + err);
              } else {
                let new_log = new Log({
                  user_id: req.user._id,
                  message: "Delete",
                  table: "customs",
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
      }
    );
  },
  // Custom Delete Data End
};
