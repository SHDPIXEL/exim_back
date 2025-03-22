const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");

const fs = require("fs");

var sql = require("mssql");

var moment = require("moment");

sql.close();

// config for your database

var config = {
  user: "exim07",

  password: "Asiapacific@2021",

  // password: 'nFw10!k0',

  // server: '50.115.114.109',

  server: "103.21.58.193",

  database: "eximindia",

  //port: 1434
};

// connect to your database

sql.connect(config, function (err) {
  console.log("sqlconnection" + config);

  if (err) console.log("0000", err);
});

// Bring in News Model

let News = require("../models/news");

// Bring in Log Model

let Log = require("../models/log");

module.exports = {
  // News List Start

  list: function (req, res) {
    res.render("news/list_news");
  },

  // addNewField: async function(req,res){
  //   try {
  //     const result = await News.updateMany({}, { $set: { inFocus: false } });
  //     console.log(`Updated ${result.modifiedCount} documents.`);
  // } catch (error) {
  //     console.error('Error updating documents:', error);
  // }
  // },

  // News List End
    new_update_inFocus: async function (req, res) {
      try {
        let { id } = req.body;
        console.log("Received ID:", id); // Debugging log
    
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid News ID" });
        }
    
        // Find the news item
        const newsItem = await News.findById(id);
        if (!newsItem) {
          return res.status(404).json({ error: "News item not found" });
        }
    
        // Toggle inFocus
        newsItem.inFocus = !newsItem.inFocus;
        await newsItem.save();
    
        res.json({
          success: true,
          message: "In Focus status updated.",
          inFocus: newsItem.inFocus,
        });
      } catch (error) {
        console.error("Error updating inFocus:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  // Get News Data Start

  get_news_recent: function (req, res) {
    try {
      // Category ID to Name Mapping
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

      // Validate and extract order
      var col =
        req.body.columns?.[req.body.order?.[0]?.column]?.data ||
        "default_column";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var category_search = req.body.columns?.[1]?.search?.value
        ? { category_id: req.body.columns[1].search.value }
        : {};
      var date_search = req.body.columns?.[3]?.search?.value
        ? { date: req.body.columns[3].search.value }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [common_search, category_search, date_search],
      };

      // Count total records
      News.count({}, function (err, recordsTotal) {
        if (err) throw err;

        // Count filtered records
        News.count(searchStr, function (err, recordsFiltered) {
          if (err) throw err;

          // Fetch filtered records
          News.find(
            searchStr,
            "_id category_id headline date breaking_news four_lines image sql_id description",
            {
              skip: 0, // Always start from the most recent
              limit: 18, // Fetch only 18 recent news
            }
          )
            .sort({ [col]: order })
            .exec(function (err, results) {
              if (err) throw err;

              // Map category_id to category name
              results = results.map((news) => ({
                ...news._doc,
                category_name:
                  categoryMap[news.category_id] || "Unknown Category",
              }));

              // Send response
              res.send({
                draw: req.body.draw || 0,
                recordsFiltered,
                recordsTotal,
                data: results,
              });
            });
        });
      });
    } catch (error) {
      console.error("Error in get_news_recent:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  get_news_pagination: function (req, res) {
    try {
      // Validate and extract order
      var col = req.body.columns?.[req.body.order?.[0]?.column]?.data || "date"; // Default sorting by date
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      console.log("Received page:", req.body);
      console.log("Received page:", req.body.page);

      // Validate and extract search filters
      var category_search = req.body.columns?.[1]?.search?.value
        ? { category_id: req.body.columns[1].search.value }
        : {};
      var date_search = req.body.columns?.[3]?.search?.value
        ? { date: req.body.columns[3].search.value }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [common_search, category_search, date_search],
      };

      // Get page number from request (default: 1)
      let page = Number(req.body.page) || 1;
      let limit = 5; // News per page
      let skip = (page - 1) * limit;

      // Count total and filtered records
      News.count({}, function (err, recordsTotal) {
        if (err)
          return res
            .status(500)
            .send({ error: "Error counting total records" });

        News.count(searchStr, function (err, recordsFiltered) {
          if (err)
            return res
              .status(500)
              .send({ error: "Error counting filtered records" });

          // Fetch filtered records with pagination
          News.find(
            searchStr,
            "_id category_id headline date breaking_news four_lines image sql_id description",
            {
              skip: skip,
              limit: limit,
            }
          )
            .sort({ [col]: order })
            .exec(function (err, results) {
              if (err)
                return res.status(500).send({ error: "Error fetching news" });

              // Send response
              res.send({
                draw: req.body.draw || 0,
                recordsFiltered,
                recordsTotal,
                data: results,
                currentPage: page,
                totalPages: Math.ceil(recordsFiltered / limit),
              });
            });
        });
      });
    } catch (error) {
      console.error("Error in get_news_pagination:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  get_news_topstories: function (req, res) {
    try {
      // Category ID to Name Mapping
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

      // Validate and extract order
      var col =
        req.body.columns?.[req.body.order?.[0]?.column]?.data ||
        "default_column";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var date_search = req.body.columns?.[3]?.search?.value
        ? { date: req.body.columns[3].search.value }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      // Filter to include only category_id 2 (Trade News) and 5 (Indian Economy)
      var category_search = { category_id: { $in: [2, 5] } };

      var searchStr = {
        $and: [common_search, category_search, date_search],
      };

      // Count total records
      News.count({}, function (err, recordsTotal) {
        if (err) throw err;

        // Count filtered records
        News.count(searchStr, function (err, recordsFiltered) {
          if (err) throw err;

          // Fetch filtered records
          News.find(
            searchStr,
            "_id category_id headline date breaking_news four_lines image sql_id description",
            {
              skip: 0, // Always start from the most recent
              limit: 6, // Fetch only 18 recent news
            }
          )
            .sort({ [col]: order })
            .exec(function (err, results) {
              if (err) throw err;

              // Map category_id to category name
              results = results.map((news) => ({
                ...news._doc,
                category_name:
                  categoryMap[news.category_id] || "Unknown Category",
              }));

              // Send response
              res.send({
                draw: req.body.draw || 0,
                recordsFiltered,
                recordsTotal,
                data: results,
              });
            });
        });
      });
    } catch (error) {
      console.error("Error in get_news_recent:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  get_news_id: function (req, res) {
    try {
      // Extract newsId from params
      var newsIdFilter = req.params.id ? { _id: req.params.id } : {};

      // Validate and extract order
      var col =
        req.body.columns?.[req.body.order?.[0]?.column]?.data ||
        "default_column";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var category_search = req.body.columns?.[1]?.search?.value
        ? { category_id: req.body.columns[1].search.value }
        : {};
      var date_search = req.body.columns?.[3]?.search?.value
        ? { date: req.body.columns[3].search.value }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { image: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [common_search, category_search, date_search, newsIdFilter],
      };

      // Category mapping
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

      // Count total records
      News.count({}, function (err, recordsTotal) {
        if (err) throw err;

        // Count filtered records
        News.count(searchStr, function (err, recordsFiltered) {
          if (err) throw err;

          // Fetch filtered records
          News.find(
            searchStr,
            "_id category_id headline date breaking_news four_lines image sql_id description",
            {
              skip: Number(req.body.start) || 0,
              limit:
                req.body.length != -1
                  ? Number(req.body.length)
                  : recordsFiltered,
            }
          )
            .sort({ [col]: order })
            .exec(function (err, results) {
              if (err) throw err;

              // Map category_id to category_name
              results = results.map((news) => ({
                ...news._doc,
                category_name:
                  categoryMap[news.category_id] || "Unknown Category",
              }));

              // Fetch the 4 most recent news articles
              News.find({})
                .sort({ date: -1 })
                .limit(4)
                .exec(function (err, recentNews) {
                  if (err) throw err;

                  // Map category_id to category_name for recent news
                  recentNews = recentNews.map((news) => ({
                    ...news._doc,
                    category_name:
                      categoryMap[news.category_id] || "Unknown Category",
                  }));

                  // Fetch top headlines (index 11 to 17)
                  News.find({})
                    .sort({ date: -1 })
                    .skip(11)
                    .limit(7) // Fetching 7 records from index 11 to 17
                    .exec(function (err, topHeadlines) {
                      if (err) throw err;

                      // Map category_id to category_name for top headlines
                      topHeadlines = topHeadlines.map((news) => ({
                        ...news._doc,
                        category_name:
                          categoryMap[news.category_id] || "Unknown Category",
                      }));

                      // Send response
                      res.send({
                        draw: req.body.draw || 0,
                        recordsFiltered,
                        recordsTotal,
                        data: results,
                        recentNews, // Include recent news
                        topHeadlines, // Include top headlines (index 11 to 17)
                      });
                    });
                });
            });
        });
      });
    } catch (error) {
      console.error("Error in get_news:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  get_category_news: function (req, res) {
    try {
      // Validate and extract order
      var col =
        req.body.columns?.[req.body.order?.[0]?.column]?.data ||
        "default_column";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var category_search = req.body.columns?.[1]?.search?.value
        ? { $or: [{ category_id: req.body.columns[1].search.value }] }
        : {};
      var date_search = req.body.columns?.[3]?.search?.value
        ? { $or: [{ date: req.body.columns[3].search.value }] }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { image: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [common_search, category_search, date_search],
      };

      // Category mapping
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

      // Count total records
      News.count({}, function (err, recordsTotal) {
        if (err) throw err;

        // Count filtered records
        News.count(searchStr, function (err, recordsFiltered) {
          if (err) throw err;

          // Fetch one news per category (total 8 news)
          let newsPromises = Object.keys(categoryMap).map((categoryId) => {
            return News.findOne({ category_id: categoryId })
              .sort({ [col]: order }) // Latest news first
              .lean()
              .exec();
          });

          Promise.all(newsPromises)
            .then((newsByCategory) => {
              // Filter out null values (if no news exists for a category)
              let filteredNews = newsByCategory.filter((news) => news !== null);

              // Add category name to each news item
              filteredNews = filteredNews.map((news) => ({
                ...news,
                category_name:
                  categoryMap[news.category_id] || "Unknown Category",
              }));

              // Send response
              res.send({
                draw: req.body.draw || 0,
                recordsFiltered,
                recordsTotal,
                data: filteredNews, // Only one news per category
              });
            })
            .catch((error) => {
              console.error("Error fetching news:", error);
              res.status(500).send({ error: "Internal server error" });
            });
        });
      });
    } catch (error) {
      console.error("Error in get_news:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  get_news_by_category_id: function (req, res) {
    try {
      const categoryId = parseInt(req.body.categoryId); // Ensure it's a number
      const page = parseInt(req.body.page) || 1; // Extract page number from query params
      const limit = 5; // 5 news per page
      const skip = (page - 1) * limit;

      console.log("Category ID:", categoryId);
      console.log("page", page);

      // Validate and extract order
      var col = req.body.columns?.[req.body.order?.[0]?.column]?.data || "date";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var date_search = req.body.columns?.[3]?.search?.value
        ? { date: req.body.columns[3].search.value }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [{ category_id: categoryId }, common_search, date_search],
      };

      // Category mapping
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

      // Count total records for pagination
      News.count({ category_id: categoryId }, function (err, totalRecords) {
        if (err) {
          console.error("Database Error (countDocuments):", err);
          return res
            .status(500)
            .json({ error: "Database error while counting records." });
        }

        // Fetch paginated news
        News.find(
          searchStr,
          "_id category_id headline date breaking_news four_lines image sql_id description"
        )
          .sort({ [col]: order })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(function (err, results) {
            if (err) {
              console.error("Database Error (find):", err);
              return res
                .status(500)
                .json({ error: "Database error while fetching records." });
            }

            // Add category name
            results = results.map((news) => ({
              ...news,
              category_name:
                categoryMap[news.category_id] || "Unknown Category",
            }));

            // Send response
            res.json({
              page,
              totalPages: Math.ceil(totalRecords / limit),
              totalRecords,
              data: results,
            });
          });
      });
    } catch (error) {
      console.error("Error in get_news_by_category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  get_news: function (req, res) {
    try {
      // Validate and extract order
      var col =
        req.body.columns?.[req.body.order?.[0]?.column]?.data ||
        "default_column";
      var order = req.body.order?.[0]?.dir === "asc" ? 1 : -1;

      // Validate and extract search filters
      var category_search = req.body.columns?.[1]?.search?.value
        ? { $or: [{ category_id: req.body.columns[1].search.value }] }
        : {};
      var date_search = req.body.columns?.[3]?.search?.value
        ? { $or: [{ date: req.body.columns[3].search.value }] }
        : {};

      var common_search = req.body.search?.value
        ? {
            $or: [
              { headline: { $regex: req.body.search.value, $options: "i" } },
              {
                breaking_news: { $regex: req.body.search.value, $options: "i" },
              },
              { description: { $regex: req.body.search.value, $options: "i" } },
              { four_lines: { $regex: req.body.search.value, $options: "i" } },
              { sql_id: { $regex: req.body.search.value, $options: "i" } },
              { inFocus: { $regex: req.body.search.value, $options: "i" } },
            ],
          }
        : {};

      var searchStr = {
        $and: [common_search, category_search, date_search],
      };

      // Count total records
      News.count({}, function (err, recordsTotal) {
        if (err) throw err;

        // Count filtered records
        News.count(searchStr, function (err, recordsFiltered) {
          if (err) throw err;

          // Fetch filtered records
          News.find(
            searchStr,
            "_id category_id headline date breaking_news four_lines image sql_id description inFocus",
            {
              skip: Number(req.body.start) || 0,
              limit:
                req.body.length != -1
                  ? Number(req.body.length)
                  : recordsFiltered,
            },
            function (err, results) {
              if (err) throw err;

              // Send response
              res.send({
                draw: req.body.draw || 0,
                recordsFiltered,
                recordsTotal,
                data: results,
              });
            }
          ).sort({ [col]: order });
        });
      });
    } catch (error) {
      console.error("Error in get_news:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  // Get News Data End

  // News Add Form Start

  add: function (req, res) {
    res.render("news/add_news");
  },

  // News Add Form End

  // News Store Data Start

  store: function (req, res) {
    const category_id = req.body.category_id;

    const date = req.body.date;

    const headline = req.body.headline;

    const breaking_news = req.body.breaking_news;

    const description = req.body.description;

    const four_lines = req.body.four_lines;

    const image =
      req.file !== undefined
        ? "https://eximback.demo.shdpixel.com/uploads/news/" + req.file.filename
        : "";

    const current_date_time = moment().format("YYYY-MM-DD HH:mm:ss");

    // create Request object

    var request = new sql.Request();

    // console.log("instore" + req.body);

    if (category_id != "7" && category_id != "8") {
      console.log("instore if" + category_id);

      // console.log('if', category_id);return false;

      // query to the database and get the records

      request.query(
        "INSERT INTO newsinformation (Headline, CategoryID, URLNo, mainnews, NewsDate, fourlines, Details, AddDate)VALUES ('" +
          headline +
          "', '" +
          category_id +
          "', '0', '0', '" +
          date +
          "', '" +
          four_lines +
          "', '" +
          description +
          "', '" +
          current_date_time +
          "')",
        function (err) {
          if (err) {
            console.log("Sql Error: " + err);

            return;
          }

          request.query("SELECT @@IDENTITY AS id", function (error, recordset) {
            // console.log(recordset.recordset[0].id);return false;

            let new_news = new News({
              category_id: category_id,

              date: date,

              headline: headline,

              breaking_news: breaking_news,

              description: description,

              four_lines: four_lines,

              image: image,

              // sql_id: ''

              sql_id: recordset.recordset[0].id,
            });

            new_news.save(function (err) {
              if (err) {
                console.log(err);

                res.send("error|" + err);
              } else {
                let new_log = new Log({
                  user_id: req.user._id,

                  message: "Add",

                  table: "news",
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
          });
        }
      );
    } else {
      // console.log('else', category_id);return false;

      let new_news = new News({
        category_id: category_id,

        date: date,

        headline: headline,

        breaking_news: breaking_news,

        description: description,

        four_lines: four_lines,

        image: image,

        sql_id:
          typeof recordset === "undefined" ? "" : recordset.recordset[0].id,
      });

      new_news.save(function (err) {
        if (err) {
          console.log(err);

          res.send("error|" + err);
        } else {
          let new_log = new Log({
            user_id: req.user._id,

            message: "Add",

            table: "news",
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
  },

  // News Store Data End

  // News Edit Form Start

  edit: function (req, res) {
    if (typeof (req.params.id == "undefined")) {
      News.findOne({ _id: req.params.mongo_id }, function (err, news) {
        if (news) {
          res.render("news/edit_news", {
            news: news,
          });
        }
      });
    } else {
      News.findOne({ sql_id: req.params.id }, function (err, news) {
        if (news) {
          res.render("news/edit_news", {
            news: news,
          });
        }
      });
    }
  },

  // News Edit Form End

  // News Update Data Start

  update: function (req, res) {
    // let query = {_id: req.params.id}

    if (req.params.id == undefined) {
      // console.log('if');return false;

      News.findOne({ _id: req.params.mongo_id }, function (err, news) {
        if (news) {
          news.category_id = req.body.category_id;

          news.date = req.body.date;

          news.headline = req.body.headline;

          news.breaking_news = req.body.breaking_news;

          news.description = req.body.description;

          news.four_lines = req.body.four_lines;

          if (req.file !== undefined) {
            /*if(news.image !== '') {

		    				var image = news.image.split('/');

		    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5];

							// console.log(image);

			    			fs.unlink(image, function (err) {

							    if (err) { 

							    	console.log(err);

							    }

							    // if no error, file has been deleted successfully

							    console.log('File deleted!');return false;

							});

		    			}*/

            news.image =
              "https://eximback.demo.shdpixel.com/uploads/news/" +
              req.file.filename;
          }

          // console.log(news);return false;

          news.save(function (err) {
            if (err) {
              console.log(err);

              res.send("error|" + err);
            } else {
              let new_log = new Log({
                user_id: req.user._id,

                message: "Edit",

                table: "news",
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
    } else {
      // console.log('else');return false;

      // create Request object

      var request = new sql.Request();

      // query to the database and get the records

      request.query(
        "UPDATE newsinformation SET Headline = '" +
          req.body.headline +
          "', CategoryID = '" +
          req.body.category_id +
          "', NewsDate = '" +
          req.body.date +
          "', fourlines = '" +
          req.body.four_lines +
          "', Details = '" +
          req.body.description +
          "' WHERE NewsId = " +
          req.params.id +
          "",
        function (err) {
          if (err) {
            console.log("Sql Error: " + err);

            return;
          }

          // let news = {};

          News.findOne({ sql_id: req.params.id }, function (err, news) {
            if (news) {
              news.category_id = req.body.category_id;

              news.date = req.body.date;

              news.headline = req.body.headline;

              news.breaking_news = req.body.breaking_news;

              news.description = req.body.description;

              news.four_lines = req.body.four_lines;

              if (req.file !== undefined) {
                /*if(news.image !== '') {

			    				var image = news.image.split('/');

			    				image = './public/'+image[3]+'/'+image[4]+'/'+image[5];

								// console.log(image);

				    			fs.unlink(image, function (err) {

								    if (err) { 

								    	console.log(err);

								    }

								    // if no error, file has been deleted successfully

								    console.log('File deleted!');return false;

								});

			    			}*/

                news.image =
                  "https://eximback.demo.shdpixel.com/uploads/news/" +
                  req.file.filename;
              }

              // console.log(news);return false;

              news.save(function (err) {
                if (err) {
                  console.log(err);

                  res.send("error|" + err);
                } else {
                  let new_log = new Log({
                    user_id: req.user._id,

                    message: "Edit",

                    table: "news",
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
    }
  },

  // News Update Data End

  // News Delete Data Start

  delete: function (req, res) {
    // let query = {'sql_id': req.params.id}

    if (req.params.id != undefined) {
      // console.log('if');return false;

      // create Request object

      var request = new sql.Request();

      // query to the database and get the records

      request.query(
        "DELETE FROM newsinformation WHERE NewsId = " + req.params.id + "",
        function (err) {
          if (err) {
            console.log("Sql Error: " + err);

            return;
          }

          News.findOne({ sql_id: req.params.id }, function (err, news) {
            if (news) {
              if (news.image != "") {
                var image = news.image.split("/");

                image =
                  "./public/" + image[3] + "/" + image[4] + "/" + image[5];

                // console.log(image);return false;

                fs.unlink(image, function (err) {
                  if (err) {
                    // throw err;

                    console.log(err);

                    return res.send("error|" + err);
                  }

                  // if no error, file has been deleted successfully

                  console.log("File deleted!");
                });
              }

              News.remove({ sql_id: req.params.id }, function (err) {
                if (err) {
                  console.log(err);

                  res.send("error|" + err);
                } else {
                  let new_log = new Log({
                    user_id: req.user._id,

                    message: "Delete",

                    table: "news",
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
    } else {
      // console.log('else');return false;

      News.findOne({ _id: req.params.mongo_id }, function (err, news) {
        if (news) {
          if (news.image != "") {
            var image = news.image.split("/");

            image = "./public/" + image[3] + "/" + image[4] + "/" + image[5];

            // console.log(image);return false;

            fs.unlink(image, function (err) {
              if (err) {
                // throw err;

                console.log(err);

                return res.send("error|" + err);
              }

              // if no error, file has been deleted successfully

              console.log("File deleted!");
            });
          }

          News.remove({ _id: req.params.mongo_id }, function (err) {
            if (err) {
              console.log(err);

              res.send("error|" + err);
            } else {
              let new_log = new Log({
                user_id: req.user._id,

                message: "Delete",

                table: "news",
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
  },

  // News Delete Data End
};
