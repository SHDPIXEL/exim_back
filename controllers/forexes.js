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

// Bring in Forexes Model
let Forex = require("../models/forex");
// Bring in Currency Model
let Currency = require("../models/currency");
// Bring in Log Model
let Log = require("../models/log");

module.exports = {
  // Forexes List Start
  list: function (req, res) {
    res.render("forexes/list_forex");
  },
  // Forexes List End

  // Get Forexes Data Start
  get_forexes: function (req, res) {
    try {
      // Safely extract ordering information from the request body
      const columns = req.body && req.body.columns ? req.body.columns : [];
      const orderArray = req.body && req.body.order ? req.body.order : [];
      const searchValue =
        req.body && req.body.search ? req.body.search.value : "";

      // Default column name and sort order if not provided
      let col =
        columns.length > 0 && orderArray.length > 0
          ? columns[orderArray[0].column]
            ? columns[orderArray[0].column].data
            : "sql_id"
          : "sql_id";
      let order = orderArray.length > 0 && orderArray[0].dir === "asc" ? 1 : -1;

      // If a date search value is provided in the 3rd column, use it, otherwise default to an empty object.
      let date_search = {};
      if (columns.length >= 3 && columns[2].search && columns[2].search.value) {
        date_search = { $or: [{ date: columns[2].search.value }] };
      }

      // Build the column ordering object
      const column_order = { [col]: order };

      // Build the common search criteria if provided
      let common_search = {};
      if (searchValue) {
        common_search = {
          $or: [
            { currency: { $regex: searchValue, $options: "i" } },
            {
              tt_selling_rates_clean_remittance_outwards: {
                $regex: searchValue,
                $options: "i",
              },
            },
            {
              bill_selling_rates_for_imports: {
                $regex: searchValue,
                $options: "i",
              },
            },
            {
              tt_buying_rates_clean_remittance_inwards: {
                $regex: searchValue,
                $options: "i",
              },
            },
            {
              bill_buying_rates_for_exports: {
                $regex: searchValue,
                $options: "i",
              },
            },
            { sql_id: { $regex: searchValue, $options: "i" } },
          ],
        };
      }

      // Combine search criteria
      const searchStr = { $and: [common_search, date_search] };

      // Get total record count first
      Forex.count({}, function (err, totalCount) {
        if (err) {
          console.error("Error counting total records:", err);
          return res.status(500).json({ error: err.message });
        }
        const recordsTotal = totalCount;
        // Count records matching the search criteria
        Forex.count(searchStr, function (err, filteredCount) {
          if (err) {
            console.error("Error counting filtered records:", err);
            return res.status(500).json({ error: err.message });
          }
          const recordsFiltered = filteredCount;
          // Query for the results with paging
          Forex.find(
            searchStr,
            "_id sql_id currency tt_selling_rates_clean_remittance_outwards bill_selling_rates_for_imports tt_buying_rates_clean_remittance_inwards bill_buying_rates_for_exports date",
            {
              skip: Number(req.body.start) || 0,
              limit:
                req.body.length != -1 ? Number(req.body.length) : filteredCount,
            },
            function (err, results) {
              if (err) {
                console.log("Error while getting results:", err);
                return res.status(500).json({ error: err.message });
              }
              const data = JSON.stringify({
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
    } catch (error) {
      console.error("Error in get_forexes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  get_forexes_website: async function (req, res) {
	try {
	  console.log("reqbody", req.body);
	  const columns = req.body?.columns || [];
	  const orderArray = req.body?.order || [];
	  const searchValue = req.body?.search?.value || "";
  
	  // Determine sorting column
	  let col =
		columns.length > 0 && orderArray.length > 0
		  ? columns[orderArray[0].column]?.data || "sql_id"
		  : "date"; // Default to sorting by date (latest first)
	  let order = orderArray.length > 0 && orderArray[0].dir === "asc" ? 1 : -1;
	  const column_order = { [col]: order };
  
	  // Search criteria
	  let common_search = {};
	  if (searchValue) {
		common_search = {
		  $or: [
			{ currency: { $regex: searchValue, $options: "i" } },
			{ tt_selling_rates_clean_remittance_outwards: { $regex: searchValue, $options: "i" } },
			{ bill_selling_rates_for_imports: { $regex: searchValue, $options: "i" } },
			{ tt_buying_rates_clean_remittance_inwards: { $regex: searchValue, $options: "i" } },
			{ bill_buying_rates_for_exports: { $regex: searchValue, $options: "i" } },
			{ sql_id: { $regex: searchValue, $options: "i" } },
		  ],
		};
	  }
  
	  // Handle date filter properly
	  let date_search = {};
	  let queryLimit = 20;
	  let skipVal = 0;
	  let useDateFilter = false;
  
	  if (req.body.date) {
		let dateInput = req.body.date.trim(); // Extract input and trim spaces
		let dateVal = new Date(dateInput); // Use the provided YYYY-MM-DD format
  
		if (!isNaN(dateVal.getTime())) {
		  let startOfDay = new Date(dateVal);
		  startOfDay.setUTCHours(0, 0, 0, 0); // Start of day in UTC
  
		  let endOfDay = new Date(dateVal);
		  endOfDay.setUTCHours(23, 59, 59, 999); // End of day in UTC
  
		  date_search = { date: { $gte: startOfDay, $lte: endOfDay } };
		  useDateFilter = true; // Mark that date filter is applied
  
		  // Apply pagination only if a date filter is used
		  skipVal = Number(req.body.start) || 0;
		  queryLimit = req.body.length !== -1 ? Number(req.body.length) : 20;
		}
	  }
  
	  // Determine the final search filter
	  let searchStr = useDateFilter
		? { $and: [common_search, date_search] } // If date is given, only return filtered data
		: common_search; // Otherwise, return latest data
  
	  // Fetch counts
	  const recordsTotal = await Forex.count({});
	  const recordsFiltered = await Forex.count(searchStr);
  
	  // Fetch data with sorting and pagination
	  const results = await Forex.find(
		searchStr,
		"_id sql_id currency tt_selling_rates_clean_remittance_outwards bill_selling_rates_for_imports tt_buying_rates_clean_remittance_inwards bill_buying_rates_for_exports date"
	  )
		.sort(useDateFilter ? {} : { date: -1 }) // Sort by latest date only when no date filter is used
		.skip(skipVal)
		.limit(queryLimit);
  
	  res.json({
		draw: req.body.draw,
		recordsTotal,
		recordsFiltered,
		data: results,
	  });
	} catch (error) {
	  console.error("Error in get_forexes_website:", error);
	  res.status(500).json({ error: error.message });
	}
  },  
  
   

  // Get Forexes Data End

  // Forex Add Form Start
  add: function (req, res) {
    Currency.find({}, function (err, currencies) {
      if (err) {
        console.log("error", err);
        return res.send("error|" + err);
      }
      res.render("forexes/add_forex", {
        currencies: currencies,
      });
    });
  },
  // Forex Add Form End

  // Forex Store Data Start
  store: function (req, res) {
    const currency = req.body.currency;
    const tt_selling_rates_clean_remittance_outwards =
      req.body.tt_selling_rates_clean_remittance_outwards;
    const bill_selling_rates_for_imports =
      req.body.bill_selling_rates_for_imports;
    const tt_buying_rates_clean_remittance_inwards =
      req.body.tt_buying_rates_clean_remittance_inwards;
    const bill_buying_rates_for_exports =
      req.body.bill_buying_rates_for_exports;
    const date = req.body.date;

    // create Request object
    var request = new sql.Request();

    var count = 1;
    currency.map(function (val, ind) {
      // query to the database and get the records
      request.query(
        "INSERT INTO Forex_Rates (currency_name, tt_selling, tt_buying, upd_date, bill_selling, bill_buying, currency_display, curr_id) VALUES ('" +
          val +
          "', '" +
          tt_selling_rates_clean_remittance_outwards[ind] +
          "', '" +
          tt_buying_rates_clean_remittance_inwards[ind] +
          "', '" +
          date +
          "', '" +
          bill_selling_rates_for_imports[ind] +
          "', '" +
          bill_buying_rates_for_exports[ind] +
          "', 1, '" +
          count +
          "')",
        function (err) {
          if (err) {
            console.log("Sql Error: " + err);
            return;
          }
          request.query("SELECT @@IDENTITY AS id", function (error, recordset) {
            // console.log(recordset.recordset[0].id);
            let new_forex = new Forex({
              currency: val,
              tt_selling_rates_clean_remittance_outwards:
                tt_selling_rates_clean_remittance_outwards[ind],
              bill_selling_rates_for_imports:
                bill_selling_rates_for_imports[ind],
              tt_buying_rates_clean_remittance_inwards:
                tt_buying_rates_clean_remittance_inwards[ind],
              bill_buying_rates_for_exports: bill_buying_rates_for_exports[ind],
              date: date,
              // sql_id: ''
              sql_id: recordset.recordset[0].id,
            });
            new_forex.save(function (err) {
              if (err) {
                console.log(err);
                // res.send('error|'+err);
              }
            });
          });
          let new_log = new Log({
            user_id: req.user._id,
            message: "Add",
            table: "forexes",
          });

          new_log.save(function (err, user) {
            if (err) {
              console.log("err " + err);
              return res.send(err);
            }
          });
        }
      );
      count++;
    });
    res.send("success|Record Inserted Successfully.");
  },
  // Forex Store Data End

  // Forex Edit Form Start
  edit: function (req, res) {
    Currency.find({}, function (err, currencies) {
      Forex.findOne({ sql_id: req.params.id }, function (err, forex) {
        if (forex) {
          res.render("forexes/edit_forex", {
            forex: forex,
            currencies: currencies,
          });
        }
      });
    });
  },
  // Forex Edit Form End

  // Forex Update Data Start
  update: function (req, res) {
    let query = { sql_id: req.params.id };

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
      "UPDATE Forex_Rates SET currency_name = '" +
        req.body.currency +
        "', tt_selling = '" +
        req.body.tt_selling_rates_clean_remittance_outwards +
        "', tt_buying = '" +
        req.body.tt_buying_rates_clean_remittance_inwards +
        "', bill_selling = '" +
        req.body.bill_selling_rates_for_imports +
        "', bill_buying = '" +
        req.body.bill_buying_rates_for_exports +
        "' WHERE Id = " +
        req.params.id +
        "",
      function (err) {
        if (err) {
          console.log("Sql Error: " + err);
          return;
        }

        Forex.findOne({ sql_id: req.params.id }, function (err, forex) {
          if (forex) {
            forex.currency = req.body.currency;
            forex.tt_selling_rates_clean_remittance_outwards =
              req.body.tt_selling_rates_clean_remittance_outwards;
            forex.bill_selling_rates_for_imports =
              req.body.bill_selling_rates_for_imports;
            forex.tt_buying_rates_clean_remittance_inwards =
              req.body.tt_buying_rates_clean_remittance_inwards;
            forex.bill_buying_rates_for_exports =
              req.body.bill_buying_rates_for_exports;
            forex.date = req.body.date;
            forex.save(function (err) {
              if (err) {
                console.log(err);
                res.send("error|" + err);
              } else {
                let new_log = new Log({
                  user_id: req.user._id,
                  message: "Edit",
                  table: "forexes",
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
  // Forex Update Data End

  // Forex Delete Data Start
  delete: function (req, res) {
    let query = { sql_id: req.params.id };

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
      "DELETE FROM Forex_Rates WHERE Id = " + req.params.id + "",
      function (err) {
        if (err) {
          console.log("Sql Error: " + err);
          return;
        }

        Forex.findOne({ sql_id: req.params.id }, function (err, forex) {
          if (forex) {
            Forex.remove(query, function (err) {
              if (err) {
                console.log(err);
                res.send("error|" + err);
              } else {
                let new_log = new Log({
                  user_id: req.user._id,
                  message: "Delete",
                  table: "forexes",
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
  // Forex Delete Data End
};
