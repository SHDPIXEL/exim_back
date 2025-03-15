const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay"); // For order creation
const crypto = require("crypto"); // For verifying Razorpay payment signature

const moment = require("moment");

const mailer = require("nodemailer");

// App User Model
let AppUser = require("../models/appUser");
// News Model
let News = require("../models/news");
// Customs Model
let Customs = require("../models/customs");
// Forex Model
let Forex = require("../models/forex");
// Digital Copy Model
let DigitalCopy = require("../models/digitalCopy");
// Year Book Model
let YearBook = require("../models/yearBook");
// Event Model
let Event = require("../models/event");
// Testimonial Model
let Testimonial = require("../models/testimonial");
// About Model
let About = require("../models/about");
// Contact Model
let Contact = require("../models/contact");
// Appointment Edition Model
let AppointmentEdition = require("../models/appointmentEdition");
// Appointment Job Title Model
let AppointmentJobTitle = require("../models/appointmentJobTitle");
// Appointment Model
let Appointment = require("../models/appointment");
// Sector Model
let Sector = require("../models/sector");
//payment Model
let Payments = require("../models/payments");
// Port Model
let Port = require("../models/port");
// Vessel Model
let Vessel = require("../models/vessel");
// Advertisement Model
let Advertisement = require("../models/advertisement");
// Version Model
let Version = require("../models/version");
// Line Agent Model
let LineAgent = require("../models/lineAgent");
// Break Bulk Sector Model
let BreakBulkSector = require("../models/breakBulkSector");
// Break Bulk Vessel Model
let BreakBulkVessel = require("../models/breakBulkVessel");
// Shipping Gazette Sector Model
let GazetteLineAgent = require("../models/gazetteLineAgent");
// Event Category Sector Model
let EventCategory = require("../models/eventCategory");
// Meet Expert Model
let MeetExpert = require("../models/meetExpert");
// Question Answer Model
let QuestionAnswer = require("../models/questionAnswer");
// Question Gazette Vessel Model
let GazetteVessel = require("../models/gazetteVessel");

const generateReceiptId = () => {
  const randomNumbers = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character hex string
  return `receipt_exim_${randomNumbers}`;
};

// Store Register Route Start
module.exports = {
  register: async function (req, res) {
    try {
      console.log("Required data:", req.body);
      const {
        name,
        company_name,
        email,
        mobile,
        nature_business,
        subscribe_newsletter,
        contact_person,
        contact_person_designation,
        company_address,
        city,
        pincode,
        state,
        country,
        password,
        confirm_password,
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !company_name ||
        !email ||
        !mobile ||
        !nature_business ||
        subscribe_newsletter === undefined
      ) {
        return res
          .status(400)
          .json({ success: 0, message: "Required Fields Missing." });
      }

      // Check if password and confirm_password match
      if (password !== confirm_password) {
        return res
          .status(400)
          .json({ success: 0, message: "Passwords do not match." });
      }

      // Check if user already exists by email or mobile
      const existingUser = await AppUser.findOne({
        $or: [{ email }, { mobile }],
      });
      if (existingUser) {
        return res
          .status(400)
          .json({
            success: 0,
            message: "User with the same email or mobile already exists.",
          });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user instance
      let app_user = new AppUser({
        name,
        company_name,
        email,
        mobile,
        nature_business,
        subscribe_newsletter,
        contact_person: contact_person || "",
        contact_person_designation: contact_person_designation || "",
        company_address: company_address || "",
        city: city || "",
        pincode: pincode || "",
        state: state || "",
        country: country || "",
        password: hashedPassword,
      });

      console.log("New user created:", app_user);

      // Save new user to database
      const savedUser = await app_user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser._id, email: savedUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "1h" } // Token expires in 7 days
      );

      return res.status(200).json({
        success: 1,
        message: "Registered Successfully.",
        token,
        user_data: {
          id: savedUser._id,
          name: savedUser.name,
          company_name: savedUser.company_name,
          email: savedUser.email,
          mobile: savedUser.mobile,
          nature_business: savedUser.nature_business,
          subscribe_newsletter: savedUser.subscribe_newsletter,
          contact_person: savedUser.contact_person,
          contact_person_designation: savedUser.contact_person_designation,
          company_address: savedUser.company_address,
          city: savedUser.city,
          pincode: savedUser.pincode,
          state: savedUser.state,
          country: savedUser.country,
        },
      });
    } catch (err) {
      console.error("Error in registration:", err);
      return res
        .status(500)
        .json({ success: 0, message: "Something went wrong.", error: err });
    }
  },

  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: 0, message: "Email and password are required." });
      }

      // Find user by email
      const user = await AppUser.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: 0, message: "Invalid email or password." });
      }

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: 0, message: "Invalid email or password." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: 1,
        message: "Login Successful.",
        token,
        user_data: {
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
        },
      });
    } catch (err) {
      console.error("Error in login:", err);
      return res
        .status(500)
        .json({ success: 0, message: "Something went wrong.", error: err });
    }
  },

  orders: async function(req, res) {
    try {
      // Extract token from headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ success: 0, message: "Unauthorized: Token missing." });
      }

      console.log("token",token)
  
      // Decode token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ success: 0, message: "Invalid token." });
      }
      console.log("decoded",decoded)
  
      const userId = decoded.userId;

      console.log("userId",userId)
  
      console.log("required",req.body)
      // Extract request body
      const { amount, subscription_details, type } = req.body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: 0, message: "Invalid amount provided." });
      }
  
      // Fetch user details
      const user = await AppUser.findById(userId);
      if (!user) {
        return res.status(404).json({ success: 0, message: "User not found." });
      }
  
      // Extract user details
      const username = user.name;
      const designation = user.contact_person_designation;
  
      // Razorpay instance setup
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
  
      const receiptId = generateReceiptId();;
  
      // Order options
      const options = {
        amount: amount * 100, // Convert to smallest currency unit (paise)
        currency: "INR",
        receipt: receiptId,
      };
  
      // Create Razorpay order
      const razorpayOrder = await instance.orders.create(options);
      console.log("rzp",razorpayOrder)
      if (!razorpayOrder) {
        return res.status(500).json({ success: 0, message: "Error creating Razorpay order." });
      }
  
      // Save payment details in database
      const newPayment = await Payments.create({
        userId,
        username,
        designation,
        subscription_details,
        type,
        amount,
        paymentStatus: "pending",
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
      });

      console.log("payment",newPayment)
  
      // Success response
      return res.status(201).json({
        success: 1,
        message: "Order created successfully",
        razorpayOrder,
        paymentDetails: newPayment,
      });
  
    } catch (error) {
      console.error("Error in orders:", error);
      return res.status(500).json({ success: 0, message: "Internal server error", error: error.message });
    }
  },

  orderSuccess: async function (req, res) {
    try {
      console.log("requiredsuccess",req.body)
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res
          .status(400)
          .json({ success: 0, message: "Payment details are missing." });
      }

      // Find the order in the database
      const payment = await Payments.findOne({
        razorpayOrderId: razorpayOrderId,
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: 0, message: "Order not found." });
      }

      // Validate payment signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res
          .status(400)
          .json({ success: 0, message: "Invalid payment signature." });
      }

      // Update payment details in the database
      payment.paymentStatus = "success";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = "completed"; // Mark as completed
      await payment.save();

      console.log("paymentsuccess",payment)

      return res.status(200).json({
        success: 1,
        message: "Payment successful!",
        paymentDetails: payment,
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res
        .status(500)
        .json({
          success: 0,
          message: "An error occurred.",
          error: error.message,
        });
    }
  },

  get_payments: async function (req,res) {
    try {
      // Extract token from headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ success: 0, message: "Unauthorized: Token missing." });
      }
      console.log("token",token)
  
      // Decode token to get userId
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ success: 0, message: "Invalid token." });
      }
  
      console.log("decoded",decoded)
      const userId = decoded.userId;
  
      // Fetch payments for the user
      const payments = await Payments.find({ userId }).sort({ createdAt: -1 });
  
      if (!payments.length) {
        return res.status(404).json({ success: 0, message: "No payments found for this user." });
      }
  
      // Success response
      return res.status(200).json({
        success: 1,
        message: "Payments retrieved successfully",
        payments,
      });
  
    } catch (error) {
      console.error("Error in getPayments:", error);
      return res.status(500).json({ success: 0, message: "Internal server error", error: error.message });
    }
  },

  // Store Register Route End

  // Get News Route Start
  news: function (req, res) {
    today_date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";
    // console.log(today_date);return false;
    if (req.params.category_id != -1) {
      News.find(
        {
          $and: [{ date: today_date }, { category_id: req.params.category_id }],
        },
        function (err, data) {
          if (err) {
            let result = {};
            result.message = "Something Went Wrong.";
            result.error = err;
            result.success = 0;
            return res.status(500).json(result);
          }
          if (data != "" && data !== null) {
            let result = {};
            result.news_data = [];
            data.map(function (news) {
              let news_data = {};
              news_data.id = news._id;
              news_data.category_id = news.category_id;
              news_data.date = news.date;
              news_data.headline = news.headline;
              // news_data.breaking_news = news.breaking_news;
              news_data.image = news.image;
              news_data.description = news.description;
              news_data.four_lines = news.four_lines;
              result.news_data.push(news_data);
            });

            News.findOne(
              {
                $and: [
                  { date: today_date },
                  { category_id: req.params.category_id },
                  { breaking_news: { $ne: "" } },
                ],
              },
              function (err, breaking_news) {
                if (err) {
                  let result = {};
                  result.message = "Something Went Wrong.";
                  result.error = err;
                  result.success = 0;
                  return res.status(500).json(result);
                }
                if (breaking_news != "" && breaking_news !== null) {
                  // console.log('!=null', breaking_news);
                  result.breaking_news = breaking_news.breaking_news;
                } else {
                  // console.log('null');
                  result.breaking_news = "";
                }
              }
            ).select("breaking_news");
            result.success = 1;
            return res.status(200).json(result);
          }
          News.findOne(
            { $and: [{ date: { $lt: today_date } }] },
            function (err, data1) {
              if (err) {
                let result = {};
                result.message = "Something Went Wrong.";
                result.error = err;
                result.success = 0;
                return res.status(500).json(result);
              }
              if (data1 != "" && data1 !== null) {
                News.find(
                  {
                    $and: [
                      { date: data1.date },
                      { category_id: req.params.category_id },
                    ],
                  },
                  function (err, data2) {
                    if (err) {
                      let result = {};
                      result.message = "Something Went Wrong.";
                      result.error = err;
                      result.success = 0;
                      return res.status(500).json(result);
                    }
                    if (data2 != "" && data2 !== null) {
                      let result = {};
                      result.news_data = [];
                      data2.map(function (news) {
                        let news_data = {};
                        news_data.id = news._id;
                        news_data.category_id = news.category_id;
                        news_data.date = news.date;
                        news_data.headline = news.headline;
                        news_data.image = news.image;
                        // news_data.breaking_news = news.breaking_news;
                        news_data.description = news.description;
                        news_data.four_lines = news.four_lines;
                        result.news_data.push(news_data);
                      });

                      News.findOne(
                        {
                          $and: [
                            { date: data1.date },
                            { category_id: req.params.category_id },
                            { breaking_news: { $ne: "" } },
                          ],
                        },
                        function (err, breaking_news) {
                          if (err) {
                            let result = {};
                            result.message = "Something Went Wrong.";
                            result.error = err;
                            result.success = 0;
                            return res.status(500).json(result);
                          }
                          if (breaking_news != "" && breaking_news !== null) {
                            // console.log('!=null', breaking_news);
                            result.breaking_news = breaking_news.breaking_news;
                          } else {
                            // console.log('null');
                            result.breaking_news = "";
                          }
                        }
                      ).select("breaking_news");
                      result.success = 1;
                      return res.status(200).json(result);
                    } else {
                      let result = {};
                      result.message = "No Record Found.";
                      result.success = 0;
                      return res.status(201).json(result);
                    }
                  }
                );
              } else {
                let result = {};
                result.message = "No Record Found.";
                result.success = 0;
                return res.status(201).json(result);
              }
            }
          ).sort({ date: -1 });
        }
      );
    } else {
      News.find({ $and: [{ date: today_date }] }, function (err, data) {
        News.findOne(
          { $and: [{ date: today_date }, { breaking_news: { $ne: "" } }] },
          function (error, breaking_news) {
            if (err) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (error) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (data != "" && data !== null) {
              let result = {};
              result.news_data = [];
              data.map(function (news) {
                let news_data = {};
                news_data.id = news._id;
                news_data.category_id = news.category_id;
                news_data.date = news.date;
                news_data.headline = news.headline;
                // news_data.breaking_news = news.breaking_news;
                news_data.image = news.image;
                news_data.description = news.description;
                news_data.four_lines = news.four_lines;
                result.news_data.push(news_data);
              });

              /*if(err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }*/
              if (breaking_news != "" && breaking_news !== null) {
                console.log("!=null", breaking_news);
                result.breaking_news = breaking_news.breaking_news;
              } else {
                result.breaking_news = "";
                console.log("null");
              }
              console.log(result.breaking_news);
              result.success = 1;
              return res.status(200).json(result);
            }
            News.findOne(
              { $and: [{ date: { $lt: today_date } }] },
              function (err, data1) {
                if (err) {
                  let result = {};
                  result.message = "Something Went Wrong.";
                  result.error = err;
                  result.success = 0;
                  return res.status(500).json(result);
                }
                if (data1 != "" && data1 !== null) {
                  News.find(
                    { $and: [{ date: data1.date }] },
                    function (err, data2) {
                      News.findOne(
                        {
                          $and: [
                            { date: data1.date },
                            { breaking_news: { $ne: "" } },
                          ],
                        },
                        function (error, breaking_news) {
                          if (err) {
                            let result = {};
                            result.message = "Something Went Wrong.";
                            result.error = err;
                            result.success = 0;
                            return res.status(500).json(result);
                          }
                          if (data2 != "" && data2 !== null) {
                            let result = {};
                            result.news_data = [];
                            data2.map(function (news) {
                              let news_data = {};
                              news_data.id = news._id;
                              news_data.category_id = news.category_id;
                              news_data.date = news.date;
                              news_data.headline = news.headline;
                              // news_data.breaking_news = news.breaking_news;
                              news_data.image = news.image;
                              news_data.description = news.description;
                              news_data.four_lines = news.four_lines;
                              result.news_data.push(news_data);
                            });

                            if (breaking_news != "" && breaking_news !== null) {
                              console.log("!=null", breaking_news);
                              result.breaking_news =
                                breaking_news.breaking_news;
                            } else {
                              result.breaking_news = "";
                              console.log("null");
                            }
                            console.log(result.breaking_news);

                            /*News.findOne({$and: [{"date": data1.date},{"breaking_news": { $ne: "" }}]}, function(err, breaking_news) {
        if(err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        // if(breaking_news != '' && breaking_news !== null) {
          // console.log('!=null', breaking_news);
          result.breaking_news = breaking_news.breaking_news;
        // }
        // else {
          // console.log('null');
        // }
        // console.log(result.breaking_news);

      }).select('breaking_news');*/
                            result.success = 1;
                            return res.status(200).json(result);
                          } else {
                            let result = {};
                            result.message = "No Record Found.";
                            result.success = 0;
                            return res.status(201).json(result);
                          }
                        }
                      ).select("breaking_news");
                    }
                  );
                } else {
                  let result = {};
                  result.message = "No Record Found.";
                  result.success = 0;
                  return res.status(201).json(result);
                }
              }
            ).sort({ date: -1 });
          }
        ).select("breaking_news");
      });
    }
  },
  // Get News Route End

  // Get News Archive Route Start
  news_archive: function (req, res) {
    date = req.params.date + "T00:00:00.000Z";
    News.find({ date: date }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.news_data = [];
        data.map(function (news) {
          if (news.category_id == "1") {
            var category_name = "Shipping News";
          } else if (news.category_id == "2") {
            var category_name = "Trade News";
          } else if (news.category_id == "3") {
            var category_name = "Port News";
          } else if (news.category_id == "4") {
            var category_name = "Transport News";
          } else if (news.category_id == "5") {
            var category_name = "Indian Economy";
          } else if (news.category_id == "6") {
            var category_name = "Special Report";
          }
          let news_data = {};
          news_data.id = news._id;
          news_data.category_id = news.category_id;
          news_data.category_name = category_name;
          news_data.date = news.date;
          news_data.headline = news.headline;
          // news_data.link_url = news.link_url;
          news_data.description = news.description;
          news_data.four_lines = news.four_lines;
          news_data.image = news.image;
          result.news_data.push(news_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      }
      let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    });
  },
  // Get News Archive Route End

  // Get Searched News Route Start
  search_news: function (req, res) {
    News.find(
      { $or: [{ headline: { $regex: req.params.value, $options: "i" } }] },
      function (err, data) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data != "" && data !== null) {
          let result = {};
          result.news_data = [];
          data.map(function (news) {
            let news_data = {};
            news_data.id = news._id;
            news_data.category_id = news.category_id;
            // news_data.category_name = category_name;
            news_data.date = news.date;
            news_data.headline = news.headline;
            // news_data.link_url = news.link_url;
            news_data.description = news.description;
            news_data.four_lines = news.four_lines;
            news_data.image = news.image;
            result.news_data.push(news_data);
          });

          result.success = 1;
          return res.status(200).json(result);
        }
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(201).json(result);
      }
    ).sort({ sql_id: -1 });
  },
  // Get Searched News Route End

  // Get Customs Route Start
  customs: function (req, res) {
    if (typeof req.params.date == "undefined") {
      date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";
    } else {
      date = req.params.date + "T00:00:00.000Z";
    }
    Customs.find({ date: date }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.customs_data = [];
        data.map(function (customs) {
          let customs_data = {};
          customs_data.id = customs._id;
          customs_data.currency = customs.currency;
          customs_data.date = customs.date;
          customs_data.notification_no = customs.notification_no;
          customs_data.import = customs.import;
          customs_data.export = customs.export;
          result.customs_data.push(customs_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      }
      Customs.findOne({ date: { $lt: date } }, function (err, data1) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data1 != "" && data1 !== null) {
          Customs.find({ date: data1.date }, function (err, data2) {
            if (err) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (data2 != "" && data2 !== null) {
              let result = {};
              result.customs_data = [];
              data2.map(function (customs) {
                let customs_data = {};
                customs_data.id = customs._id;
                customs_data.currency = customs.currency;
                customs_data.date = customs.date;
                customs_data.notification_no = customs.notification_no;
                customs_data.import = customs.import;
                customs_data.export = customs.export;
                result.customs_data.push(customs_data);
              });

              result.success = 1;

              return res.status(200).json(result);
            } else {
              let result = {};
              result.message = "No Record Found.";
              result.success = 0;
              return res.status(201).json(result);
            }
          });
        } else {
          let result = {};
          result.message = "No Record Found.";
          result.success = 0;
          return res.status(201).json(result);
        }
      }).sort({ date: -1 });
    });
  },
  // Get Customs Route End

  // Get Customs Route Start
  forex: function (req, res) {
    if (typeof req.params.date == "undefined") {
      date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";
    } else {
      date = req.params.date + "T00:00:00.000Z";
    }
    Forex.find({ date: date }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.forex_data = [];
        data.map(function (forex) {
          let forex_data = {};
          forex_data.id = forex._id;
          forex_data.currency = forex.currency;
          forex_data.date = forex.date;
          forex_data.tt_selling_rate_outwards =
            forex.tt_selling_rates_clean_remittance_outwards;
          forex_data.bill_selling_rates_imports =
            forex.bill_selling_rates_for_imports;
          forex_data.tt_buying_rate_inwards =
            forex.tt_buying_rates_clean_remittance_inwards;
          forex_data.bill_buying_rates_exports =
            forex.bill_buying_rates_for_exports;
          result.forex_data.push(forex_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      }
      Forex.findOne({ date: { $lt: date } }, function (err, data1) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data1 != "" && data1 !== null) {
          Forex.find({ date: data1.date }, function (err, data2) {
            if (err) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (data2 != "" && data2 !== null) {
              let result = {};
              result.forex_data = [];
              data2.map(function (forex) {
                let forex_data = {};
                forex_data.id = forex._id;
                forex_data.currency = forex.currency;
                forex_data.date = forex.date;
                forex_data.tt_selling_rate_outwards =
                  forex.tt_selling_rates_clean_remittance_outwards;
                forex_data.bill_selling_rates_imports =
                  forex.bill_selling_rates_for_imports;
                forex_data.tt_buying_rate_inwards =
                  forex.tt_buying_rates_clean_remittance_inwards;
                forex_data.bill_buying_rates_exports =
                  forex.bill_buying_rates_for_exports;
                result.forex_data.push(forex_data);
              });

              result.success = 1;

              return res.status(200).json(result);
            } else {
              let result = {};
              result.message = "No Record Found.";
              result.success = 0;
              return res.status(201).json(result);
            }
          });
        } else {
          let result = {};
          result.message = "No Record Found.";
          result.success = 0;
          return res.status(201).json(result);
        }
      }).sort({ date: -1 });
    });
  },
  // Get Customs Route End

  // Get Digital Copy Route Start
  digital_copies: function (req, res) {
    DigitalCopy.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.digital_copy_data = [];
        data.map(function (digital_copy) {
          let digital_copy_data = {};
          digital_copy_data.id = digital_copy._id;
          digital_copy_data.name = digital_copy.name;
          digital_copy_data.url = digital_copy.url;
          digital_copy_data.image = digital_copy.image;
          digital_copy_data.status = digital_copy.status;
          result.digital_copy_data.push(digital_copy_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Digital Copy Route End

  // Get Year Book Route Start
  year_books: function (req, res) {
    YearBook.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.year_book_data = [];
        data.map(function (year_book) {
          let year_book_data = {};
          year_book_data.id = year_book._id;
          year_book_data.name = year_book.name;
          year_book_data.url = year_book.url;
          year_book_data.image = year_book.image;
          year_book_data.status = year_book.status;
          result.year_book_data.push(year_book_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Year Book Route End

  // Get Digital Copy and Year Book Route Start
  digital_copies_year_books: function (req, res) {
    Promise.all([
      DigitalCopy.find({ status: "1" }),
      YearBook.find({ status: "1" }),
    ])
      .then((results) => {
        const [digital_copies, year_books] = results;
        let result = {};
        result.digital_copy_data = [];
        digital_copies.map(function (digital_copy) {
          let digital_copy_data = {};
          digital_copy_data.id = digital_copy._id;
          digital_copy_data.name = digital_copy.name;
          digital_copy_data.url = digital_copy.url;
          digital_copy_data.image = digital_copy.image;
          digital_copy_data.status = digital_copy.status;
          result.digital_copy_data.push(digital_copy_data);
        });

        result.year_book_data = [];
        year_books.map(function (year_book) {
          let year_book_data = {};
          year_book_data.id = year_book._id;
          year_book_data.name = year_book.name;
          year_book_data.url = year_book.url;
          year_book_data.image = year_book.image;
          year_book_data.status = year_book.status;
          result.year_book_data.push(year_book_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      })
      .catch((err) => {
        console.error("Something went wrong", err);
      });
  },
  // Get Digital Copy and Year Book Route End

  // Get Event Category Route Start
  event_categories: function (req, res) {
    EventCategory.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.event_category_data = [];
        data.map(function (event_category) {
          let event_category_data = {};
          event_category_data.id = event_category._id;
          event_category_data.category = event_category.category;
          result.event_category_data.push(event_category_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Event Category Route End

  // Get Event Route Start
  events: function (req, res) {
    if (typeof req.params.category_id == "undefined") {
      var category_id = {};
    } else {
      category_id = { category_id: req.params.category_id };
    }

    if (typeof req.params.status == "undefined") {
      Event.find({}, function (err, data) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data != "" && data !== null) {
          let result = {};
          result.event_data = [];
          data.map(function (event) {
            let event_data = {};
            event_data.id = event._id;
            event_data.name = event.name;
            event_data.url = event.url;
            event_data.image = event.image;
            event_data.venue = event.venue;
            event_data.date = event.date;
            event_data.date_two = event.date_two;
            event_data.date_three = event.date_three;
            event_data.status = event.status;
            result.event_data.push(event_data);
          });

          result.success = 1;
          return res.status(200).json(result);
        } else {
          let result = {};
          result.message = "No Record Found.";
          result.success = 0;
          return res.status(500).json(result);
        }
      });
    } else {
      Event.find(
        { $and: [{ status: req.params.status }, category_id] },
        function (err, data) {
          if (err) {
            let result = {};
            result.message = "Something Went Wrong.";
            result.error = err;
            result.success = 0;
            return res.status(500).json(result);
          }
          if (data != "" && data !== null) {
            let result = {};
            result.event_data = [];
            data.map(function (event) {
              let event_data = {};
              event_data.id = event._id;
              event_data.name = event.name;
              event_data.url = event.url;
              event_data.image = event.image;
              event_data.venue = event.venue;
              event_data.date = event.date;
              event_data.date_two = event.date_two;
              event_data.date_three = event.date_three;
              event_data.status = event.status;
              result.event_data.push(event_data);
            });

            result.success = 1;
            return res.status(200).json(result);
          } else {
            let result = {};
            result.message = "No Record Found.";
            result.success = 0;
            return res.status(500).json(result);
          }
        }
      );
    }
  },
  // Get Event Route End

  // Get Testimonial Route Start
  testimonials: function (req, res) {
    Testimonial.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.testimonial_data = [];
        data.map(function (testimonial) {
          let testimonial_data = {};
          testimonial_data.id = testimonial._id;
          testimonial_data.name = testimonial.name;
          testimonial_data.company_designation =
            testimonial.company_designation;
          testimonial_data.description = testimonial.description;
          testimonial_data.status = testimonial.status;
          result.testimonial_data.push(testimonial_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Testimonial Route End

  // Get About Route Start
  about: function (req, res) {
    About.findOne({}, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.about_data = {};
        let about_data = {};
        about_data.id = data._id;
        about_data.description = data.description;
        about_data.networks = data.networks;
        about_data.readers = data.readers;
        about_data.editions = data.editions;
        result.about_data = about_data;

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get About Route End

  // Store Feedback Form Start
  send_mail: function (req, res) {
    // Use Smtp Protocol to send Email
    let smtpTransport = mailer.createTransport({
      host: "mail.eximindiaonline.in",
      port: 587,
      secure: false, //true for 465 port, false for other ports
      auth: {
        user: "info@eximindiaonline.in",
        pass: "Asia@2019",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    var mail = {
      from: "info@eximindiaonline.in",
      to: "info@eximindiaonline.in",
      subject: "Enquiry from Contact Us",
      html: `<b>Feedback Type </b>: ${req.body.type}<br><b>Name </b>: ${req.body.name}<br><b>Email </b>: ${req.body.email}<br><b>Mobile </b>: ${req.body.mobile}<br>`,
    };

    smtpTransport.sendMail(mail, function (error, resp) {
      if (error) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = error;
        result.success = 0;
        return res.status(201).json(result);
      } else {
        let result = {};
        result.message = "Mail Sent Succesfully.";
        result.success = 1;
        return res.status(200).json(result);
      }

      smtpTransport.close();
    });
  },
  // Store Feedback Form End

  // Get Contact Route Start
  head_office: function (req, res) {
    Contact.findOne({ type: "head_office" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.head_office_data = {};
        let head_office_data = {};
        head_office_data.id = data._id;
        head_office_data.office = "Mumbai";
        head_office_data.address = data.address;
        head_office_data.telephone = data.telephone;
        head_office_data.fax = data.fax;
        head_office_data.emails = data.emails;
        result.head_office_data = head_office_data;

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Contact Route End

  // Get Contact Route Start
  branch_office: function (req, res) {
    Contact.findOne({ office: req.params.id }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.branch_office_data = {};
        if (data.office == 1) {
          office = "AGRA";
        } else if (data.office == 2) {
          office = "AHMEDABAD";
        } else if (data.office == 3) {
          office = "BANGALORE";
        } else if (data.office == 4) {
          office = "BHADOHI";
        } else if (data.office == 5) {
          office = "CHENNAI";
        } else if (data.office == 6) {
          office = "GANDHIDHAM";
        } else if (data.office == 7) {
          office = "JAIPUR";
        } else if (data.office == 8) {
          office = "JAMNAGAR";
        } else if (data.office == 9) {
          office = "JODHPUR";
        } else if (data.office == 10) {
          office = "KANPUR";
        } else if (data.office == 11) {
          office = "KOCHI";
        } else if (data.office == 12) {
          office = "KOLKATA";
        } else if (data.office == 13) {
          office = "LUDHIANA";
        } else if (data.office == 14) {
          office = "MUMBAI";
        } else if (data.office == 15) {
          office = "NEW DELHI";
        } else if (data.office == 16) {
          office = "PUNE";
        } else if (data.office == 17) {
          office = "TUTICORIN";
        } else if (data.office == 18) {
          office = "VADODARA";
        } else if (data.office == 19) {
          office = "VISAKHAPATNAM";
        }
        let branch_office_data = {};
        branch_office_data.id = data._id;
        branch_office_data.office = office;
        branch_office_data.address = data.address;
        branch_office_data.telephone = data.telephone;
        branch_office_data.fax = data.fax;
        branch_office_data.emails = data.emails;
        result.branch_office_data = branch_office_data;

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Contact Route End

  // Get Appointment Edition Route Start
  editions: function (req, res) {
    AppointmentEdition.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.edition_data = [];
        data.map(function (edition) {
          let edition_data = {};
          edition_data.id = edition._id;
          edition_data.edition = edition.edition;
          result.edition_data.push(edition_data);
        });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Appointment Edition Route End

  // Get Appointment Route Start
  appointments: function (req, res) {
    todays_date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";

    seventh_date =
      moment().subtract(7, "d").format("YYYY-MM-DD") + "T00:00:00.000Z";

    Appointment.find(
      {
        $and: [
          { status: "1" },
          { edition_id: req.params.edition_id },
          { date: { $gte: seventh_date, $lte: todays_date } },
        ],
      },
      function (err, data) {
        if (err) {
          let result = {};

          result.message = "Something Went Wrong.";

          result.error = err;

          result.success = 0;

          return res.status(500).json(result);
        }

        if (data != "" && data !== null) {
          let result = {};

          result.appointment_data = [];

          data.map(function (appointment) {
            let appointment_data = {};

            appointment_data.id = appointment._id;

            appointment_data.job_title = appointment.job_title_id.job_title;

            appointment_data.date = appointment.date;

            // appointment_data.description = appointment.description;

            result.appointment_data.push(appointment_data);
          });

          result.success = 1;

          return res.status(200).json(result);
        } else {
          let result = {};

          result.message = "No Record Found.";

          result.success = 0;

          return res.status(500).json(result);
        }
      }
    )
      .populate("job_title_id", "job_title")
      .sort({ date: -1 });
  },
  // Get Appointment Route End

  // Get Appointment Details Route Start
  appointment_details: function (req, res) {
    Appointment.find(
      { $and: [{ status: "1" }, { _id: req.params.appointment_id }] },
      function (err, data) {
        if (err) {
          let result = {};

          result.message = "Something Went Wrong.";

          result.error = err;

          result.success = 0;

          return res.status(500).json(result);
        }

        if (data != "" && data !== null) {
          let result = {};

          result.appointment_details_data = [];

          data.map(function (appointment_detail) {
            let appointment_details_data = {};

            appointment_details_data.id = appointment_detail._id;

            appointment_details_data.job_title =
              appointment_detail.job_title_id.job_title;

            appointment_details_data.date = appointment_detail.date;

            appointment_details_data.description =
              appointment_detail.description;

            result.appointment_details_data.push(appointment_details_data);
          });

          result.success = 1;

          return res.status(200).json(result);
        } else {
          let result = {};

          result.message = "No Record Found.";

          result.success = 0;

          return res.status(500).json(result);
        }
      }
    )
      .populate("job_title_id", "job_title")
      .sort({ date: -1 });
  },
  // Get Appointment Details Route End

  // Get Sector Route Start
  sectors: function (req, res) {
    Sector.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.sector_data = [];
        data.map(function (sector) {
          let sector_data = {};
          sector_data.id = sector._id;
          sector_data.name = sector.name;
          sector_data.status = sector.status;
          result.sector_data.push(sector_data);
        });
        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Sector Route End

  // Get Port Route Start
  ports: function (req, res) {
    Port.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.port_data = [];
        data.map(function (sector) {
          let port_data = {};
          port_data.id = sector._id;
          port_data.name = sector.name;
          port_data.status = sector.status;
          result.port_data.push(port_data);
        });
        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Port Route End

  // Get Vessel Route Start
  vessels: function (req, res) {
    today_date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";

    if (req.params.port_id != -1) {
      Vessel.find(
        {
          $and: [
            { date: today_date },
            { sector_id: req.params.sector_id },
            { port_id: req.params.port_id },
          ],
        },
        function (err, data) {
          LineAgent.find(
            {
              $and: [
                { sector_id: req.params.sector_id },
                { port_id: req.params.port_id },
              ],
            },
            function (err, lines) {
              if (err) {
                let result = {};
                result.message = "Something Went Wrong.";
                result.error = err;
                result.success = 0;
                return res.status(500).json(result);
              }
              if (data != "" && data !== null) {
                let result = {};
                result.vessels_data = [];
                data.map(function (vessels) {
                  let vessels_data = {};
                  vessels_data.id = vessels._id;
                  vessels_data.sector_name = vessels.sector_id.name;
                  vessels_data.port_name = vessels.port_id.name;
                  vessels_data.date = vessels.date;
                  vessels_data.eta = vessels.eta;
                  vessels_data.etd = vessels.etd;
                  vessels_data.cy_cut_off_date_time =
                    vessels.cy_cut_off_date_time;
                  vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
                  vessels_data.voy_no = vessels.voy_no;
                  vessels_data.rot_no_date = vessels.rot_no_date;
                  // vessels_data.line = vessels.line;
                  // vessels_data.agent = vessels.agent;
                  // vessels_data.carting_point = vessels.carting_point;
                  result.vessels_data.push(vessels_data);
                });

                result.lines = [];
                lines.map(function (line) {
                  let line_data = {};
                  line_data.id = line._id;
                  line_data.line = line.line;
                  result.lines.push(line_data);
                });

                result.success = 1;
                return res.status(200).json(result);
              }
              Vessel.findOne(
                { $and: [{ date: { $lt: today_date } }] },
                function (err, data1) {
                  if (err) {
                    let result = {};
                    result.message = "Something Went Wrong.";
                    result.error = err;
                    result.success = 0;
                    return res.status(500).json(result);
                  }
                  if (data1 != "" && data1 !== null) {
                    Vessel.find(
                      {
                        $and: [
                          { date: data1.date },
                          { sector_id: req.params.sector_id },
                          { port_id: req.params.port_id },
                        ],
                      },
                      function (err, data2) {
                        LineAgent.find(
                          {
                            $and: [
                              { sector_id: req.params.sector_id },
                              { port_id: req.params.port_id },
                            ],
                          },
                          function (err, lines) {
                            if (err) {
                              let result = {};
                              result.message = "Something Went Wrong.";
                              result.error = err;
                              result.success = 0;
                              return res.status(500).json(result);
                            }
                            if (data2 != "" && data2 !== null) {
                              let result = {};
                              result.vessels_data = [];
                              data2.map(function (vessels) {
                                let vessels_data = {};
                                vessels_data.id = vessels._id;
                                vessels_data.sector_name =
                                  vessels.sector_id.name;
                                vessels_data.port_name = vessels.port_id.name;
                                vessels_data.date = vessels.date;
                                vessels_data.eta = vessels.eta;
                                vessels_data.etd = vessels.etd;
                                vessels_data.cy_cut_off_date_time =
                                  vessels.cy_cut_off_date_time;
                                vessels_data.vessel_name_via_no =
                                  vessels.vessel_name_via_no;
                                vessels_data.voy_no = vessels.voy_no;
                                vessels_data.rot_no_date = vessels.rot_no_date;
                                // vessels_data.line = vessels.line;
                                // vessels_data.agent = vessels.agent;
                                // vessels_data.carting_point = vessels.carting_point;
                                result.vessels_data.push(vessels_data);
                              });

                              result.lines = [];
                              lines.map(function (line) {
                                let line_data = {};
                                line_data.id = line._id;
                                line_data.line = line.line;
                                result.lines.push(line_data);
                              });

                              result.success = 1;
                              return res.status(200).json(result);
                            } else {
                              let result = {};
                              result.message = "No Record Found.";
                              result.success = 0;
                              return res.status(201).json(result);
                            }
                          }
                        ).sort({ line: 1 });
                      }
                    )
                      .populate("sector_id", "name")
                      .populate("port_id", "name");
                  } else {
                    let result = {};
                    result.message = "No Record Found.";
                    result.success = 0;
                    return res.status(201).json(result);
                  }
                }
              ).sort({ date: -1 });
            }
          );
        }
      )
        .populate("sector_id", "name")
        .populate("port_id", "name");
    } else {
      Vessel.find(
        { $and: [{ date: today_date }, { sector_id: req.params.sector_id }] },
        function (err, data) {
          // LineAgent.find({$and: [{"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, lines) {
          if (err) {
            let result = {};
            result.message = "Something Went Wrong.";
            result.error = err;
            result.success = 0;
            return res.status(500).json(result);
          }
          if (data != "" && data !== null) {
            let result = {};
            result.vessels_data = [];
            data.map(function (vessels) {
              let vessels_data = {};
              vessels_data.id = vessels._id;
              vessels_data.sector_name = vessels.sector_id.name;
              vessels_data.port_name = vessels.port_id.name;
              vessels_data.date = vessels.date;
              vessels_data.eta = vessels.eta;
              vessels_data.etd = vessels.etd;
              vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;
              vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
              vessels_data.voy_no = vessels.voy_no;
              vessels_data.rot_no_date = vessels.rot_no_date;
              // vessels_data.line = vessels.line;
              // vessels_data.agent = vessels.agent;
              // vessels_data.carting_point = vessels.carting_point;
              result.vessels_data.push(vessels_data);
            });

            /*result.lines = [];
        lines.map(function(line) {
        let line_data = {};
          line_data.id = line._id;
          line_data.line = line.line;
          result.lines.push(line_data);
      });*/

            result.success = 1;
            return res.status(200).json(result);
          }
          Vessel.findOne(
            { $and: [{ date: { $lt: today_date } }] },
            function (err, data1) {
              if (err) {
                let result = {};
                result.message = "Something Went Wrong.";
                result.error = err;
                result.success = 0;
                return res.status(500).json(result);
              }
              if (data1 != "" && data1 !== null) {
                Vessel.find(
                  {
                    $and: [
                      { date: data1.date },
                      { sector_id: req.params.sector_id },
                    ],
                  },
                  function (err, data2) {
                    // LineAgent.find({$and: [{"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, lines) {
                    if (err) {
                      let result = {};
                      result.message = "Something Went Wrong.";
                      result.error = err;
                      result.success = 0;
                      return res.status(500).json(result);
                    }
                    if (data2 != "" && data2 !== null) {
                      let result = {};
                      result.vessels_data = [];
                      data2.map(function (vessels) {
                        let vessels_data = {};
                        vessels_data.id = vessels._id;
                        vessels_data.sector_name = vessels.sector_id.name;
                        vessels_data.port_name = vessels.port_id.name;
                        vessels_data.date = vessels.date;
                        vessels_data.eta = vessels.eta;
                        vessels_data.etd = vessels.etd;
                        vessels_data.cy_cut_off_date_time =
                          vessels.cy_cut_off_date_time;
                        vessels_data.vessel_name_via_no =
                          vessels.vessel_name_via_no;
                        vessels_data.voy_no = vessels.voy_no;
                        vessels_data.rot_no_date = vessels.rot_no_date;
                        // vessels_data.line = vessels.line;
                        // vessels_data.agent = vessels.agent;
                        // vessels_data.carting_point = vessels.carting_point;
                        result.vessels_data.push(vessels_data);
                      });

                      /*result.lines = [];
        lines.map(function(line) {
        let line_data = {};
          line_data.id = line._id;
          line_data.line = line.line;
          result.lines.push(line_data);
      });*/

                      result.success = 1;
                      return res.status(200).json(result);
                    } else {
                      let result = {};
                      result.message = "No Record Found.";
                      result.success = 0;
                      return res.status(201).json(result);
                    }
                    // });
                  }
                )
                  .populate("sector_id", "name")
                  .populate("port_id", "name");
              } else {
                let result = {};
                result.message = "No Record Found.";
                result.success = 0;
                return res.status(201).json(result);
              }
            }
          ).sort({ date: -1 });
          // });
        }
      )
        .populate("sector_id", "name")
        .populate("port_id", "name");
    }
  },
  // Get Vessel Route End

  // Get Advertisements Route Start
  advertisements: function (req, res) {
    Advertisement.find({ status: "1" }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.advertisement_data = [];
        data.map(function (advertisement) {
          let advertisement_data = {};
          advertisement_data.id = advertisement._id;
          advertisement_data.category = advertisement.category;
          advertisement_data.image = advertisement.image;
          advertisement_data.url = advertisement.url;
          advertisement_data.video = advertisement.video;
          advertisement_data.order = advertisement.order;
          result.advertisement_data.push(advertisement_data);
        });
        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    }).sort({ order: 1 });
  },
  // Get Advertisements Route End

  // Store Subscription Form Start
  subscription: function (req, res) {
    // Use Smtp Protocol to send Email
    let smtpTransport = mailer.createTransport({
      host: "mail.eximindiaonline.in",
      port: 587,
      secure: false, //true for 465 port, false for other ports
      auth: {
        user: "info@eximindiaonline.in",
        pass: "Asia@2019",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    var mail = {
      from: "info@eximindiaonline.in",
      to: "headit@exim-india.com",
      // to: "ansariyazil03@gmail.com",
      subject: "Subscription Form Details from Exim Mobile App",
      html: `<b>Name </b>: ${req.body.name}<br><b>Company </b>: ${req.body.company}<br><b>Address </b>: ${req.body.address}<br><b>Email </b>: ${req.body.email}<br><b>Mobile </b>: ${req.body.mobile}<br><b>Designation </b>: ${req.body.designation}<br><b>Product </b>: ${req.body.product}<br>`,
    };

    smtpTransport.sendMail(mail, function (error, resp) {
      if (error) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = error;
        result.success = 0;
        return res.status(201).json(result);
      } else {
        let result = {};
        result.message = "Mail Sent Succesfully.";
        result.success = 1;
        return res.status(200).json(result);
      }

      smtpTransport.close();
    });
  },
  // Store Subscription Form End

  // Get Versions Route Start
  versions: function (req, res) {
    Version.findOne({}, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.version_data = {};
        // data.map(function(versions) {
        let version_data = {};
        version_data.id = data._id;
        version_data.android = data.android;
        version_data.ios = data.ios;
        result.version_data = version_data;
        // });

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Versions Route End

  // Get Agent Route Start
  agent: function (req, res) {
    console.log(req.params.id);
    LineAgent.findOne({ _id: req.params.id }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.agent = {};
        let agent = {};
        agent.id = data._id;
        agent.agent = data.agent;
        agent.carting_point = data.carting_point;
        result.agent = agent;

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Agent Route End

  // Get Break Bulk Sectors Route Start
  break_bulk_sectors: function (req, res) {
    BreakBulkSector.find(
      { sector_id: req.params.sector_id },
      function (err, data) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data != "" && data !== null) {
          let result = {};
          result.break_bulk_sector_data = [];
          data.map(function (break_bulk_sector) {
            let break_bulk_sector_data = {};
            break_bulk_sector_data.id = break_bulk_sector._id;
            break_bulk_sector_data.name = break_bulk_sector.name;
            break_bulk_sector_data.status = break_bulk_sector.status;
            result.break_bulk_sector_data.push(break_bulk_sector_data);
          });
          result.success = 1;
          return res.status(200).json(result);
        } else {
          let result = {};
          result.message = "No Record Found.";
          result.success = 0;
          return res.status(500).json(result);
        }
      }
    );
  },
  // Get Break Bulk Sectors Route End

  // Get Break Bulk Vessels Route Start
  break_bulk_vessels: function (req, res) {
    today_date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";

    // if(req.params.port_id != -1) {
    BreakBulkVessel.find(
      {
        $and: [
          { date: today_date },
          { break_bulk_sector_id: req.params.break_bulk_sector_id },
        ],
      },
      function (err, data) {
        if (err) {
          let result = {};
          result.message = "Something Went Wrong.";
          result.error = err;
          result.success = 0;
          return res.status(500).json(result);
        }
        if (data != "" && data !== null) {
          let result = {};
          result.break_bulk_vessels_data = [];
          data.map(function (break_bulk_vessel) {
            let break_bulk_vessels_data = {};
            break_bulk_vessels_data.id = break_bulk_vessel._id;
            break_bulk_vessels_data.sector_name =
              break_bulk_vessel.break_bulk_sector_id.name;
            break_bulk_vessels_data.date = break_bulk_vessel.date;
            break_bulk_vessels_data.eta = break_bulk_vessel.eta;
            break_bulk_vessels_data.etd = break_bulk_vessel.etd;
            break_bulk_vessels_data.vessel_name_via_no =
              break_bulk_vessel.vessel_name_via_no;
            break_bulk_vessels_data.voy_no = break_bulk_vessel.voy_no;
            break_bulk_vessels_data.rot_no_date = break_bulk_vessel.rot_no_date;
            break_bulk_vessels_data.line = break_bulk_vessel.line;
            break_bulk_vessels_data.agent = break_bulk_vessel.agent;
            break_bulk_vessels_data.carting_point =
              break_bulk_vessel.carting_point;
            result.break_bulk_vessels_data.push(break_bulk_vessels_data);
          });

          result.success = 1;
          return res.status(200).json(result);
        }
        BreakBulkVessel.findOne(
          { $and: [{ date: { $lt: today_date } }] },
          function (err, data1) {
            if (err) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (data1 != "" && data1 !== null) {
              BreakBulkVessel.find(
                {
                  $and: [
                    { date: data1.date },
                    { break_bulk_sector_id: req.params.break_bulk_sector_id },
                  ],
                },
                function (err, data2) {
                  if (err) {
                    let result = {};
                    result.message = "Something Went Wrong.";
                    result.error = err;
                    result.success = 0;
                    return res.status(500).json(result);
                  }
                  if (data2 != "" && data2 !== null) {
                    let result = {};
                    result.break_bulk_vessels_data = [];
                    data2.map(function (break_bulk_vessel) {
                      let break_bulk_vessels_data = {};
                      break_bulk_vessels_data.id = break_bulk_vessel._id;
                      break_bulk_vessels_data.sector_name =
                        break_bulk_vessel.break_bulk_sector_id.name;
                      break_bulk_vessels_data.date = break_bulk_vessel.date;
                      break_bulk_vessels_data.eta = break_bulk_vessel.eta;
                      break_bulk_vessels_data.etd = break_bulk_vessel.etd;
                      break_bulk_vessels_data.vessel_name_via_no =
                        break_bulk_vessel.vessel_name_via_no;
                      break_bulk_vessels_data.voy_no = break_bulk_vessel.voy_no;
                      break_bulk_vessels_data.rot_no_date =
                        break_bulk_vessel.rot_no_date;
                      break_bulk_vessels_data.line = break_bulk_vessel.line;
                      break_bulk_vessels_data.agent = break_bulk_vessel.agent;
                      break_bulk_vessels_data.carting_point =
                        break_bulk_vessel.carting_point;
                      result.break_bulk_vessels_data.push(
                        break_bulk_vessels_data
                      );
                    });

                    result.success = 1;
                    return res.status(200).json(result);
                  } else {
                    let result = {};
                    result.message = "No Record Found.";
                    result.success = 0;
                    return res.status(201).json(result);
                  }
                }
              ).populate("break_bulk_sector_id", "name");
            } else {
              let result = {};
              result.message = "No Record Found.";
              result.success = 0;
              return res.status(201).json(result);
            }
          }
        ).sort({ date: -1 });
      }
    ).populate("break_bulk_sector_id", "name");
    /*} else {
  Vessel.find({$and: [{"date": today_date}, {"sector_id": req.params.sector_id}]}, function(err, data) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
       let result = {};
      result.vessels_data = [];
      data.map(function(vessels) {
      let vessels_data = {};
        vessels_data.id = vessels._id;
        vessels_data.sector_name = vessels.sector_id.name;
        vessels_data.port_name = vessels.port_id.name;
        vessels_data.date = vessels.date;
        vessels_data.eta = vessels.eta;
        vessels_data.etd = vessels.etd;
        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;
        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
        vessels_data.voy_no = vessels.voy_no;
        vessels_data.rot_no_date = vessels.rot_no_date;
        vessels_data.line = vessels.line;
        vessels_data.agent = vessels.agent;
        vessels_data.carting_point = vessels.carting_point;
        result.vessels_data.push(vessels_data);
      });

      result.success = 1;
      return res.status(200).json(result);
    }
    Vessel.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data1 != '' && data1 !== null) {

    Vessel.find({$and: [{"date": data1.date}, {"sector_id": req.params.sector_id}]}, function(err, data2) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data2 != '' && data2 !== null) {
       let result = {};
      result.vessels_data = [];
      data2.map(function(vessels) {
      let vessels_data = {};
        vessels_data.id = vessels._id;
        vessels_data.sector_name = vessels.sector_id.name;
        vessels_data.port_name = vessels.port_id.name;
        vessels_data.date = vessels.date;
        vessels_data.eta = vessels.eta;
        vessels_data.etd = vessels.etd;
        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;
        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
        vessels_data.voy_no = vessels.voy_no;
        vessels_data.rot_no_date = vessels.rot_no_date;
        vessels_data.line = vessels.line;
        vessels_data.agent = vessels.agent;
        vessels_data.carting_point = vessels.carting_point;
        result.vessels_data.push(vessels_data);
      });

      result.success = 1;
      return res.status(200).json(result);
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).populate('sector_id', 'name').populate('port_id', 'name');
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).sort({'date': -1});
  }).populate('sector_id', 'name').populate('port_id', 'name');
  }*/
  },
  // Get Break Bulk Vessels Route End

  // Get Shipping Gazette Sectors Route Start
  /*shipping_gazette_sectors: function(req, res) {
    GazetteLineAgent.find({"sector_id": req.params.sector_id}, function(err, data) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
      let result = {};
      result.shipping_gazette_sector_data = [];
      data.map(function(shipping_gazette_sector) {
      let shipping_gazette_sector_data = {};
        shipping_gazette_sector_data.id = shipping_gazette_sector._id;
        if(shipping_gazette_sector.gazette_sector_id == '1') {
          var gazette_sector = 'EUROP/GULF';
        } else if(shipping_gazette_sector.gazette_sector_id == '2') {
          gazette_sector = 'USA/EUROP';
        } else if(shipping_gazette_sector.gazette_sector_id == '3') {
          gazette_sector = 'GULF/AFRICA';
        } else if(shipping_gazette_sector.gazette_sector_id == '4') {
          gazette_sector = 'FAR EAST/INDIAN SUB CONTINENT';
        } else if(shipping_gazette_sector.gazette_sector_id == '5') {
          gazette_sector = 'GULF/FAR EAST';
        } else if(shipping_gazette_sector.gazette_sector_id == '6') {
          gazette_sector = 'GULF';
        }
        shipping_gazette_sector_data.sector = gazette_sector;
        shipping_gazette_sector_data.terminal = shipping_gazette_sector.port_id.name;
        if(shipping_gazette_sector.service_id == '1') {
          var gazette_service = 'HIMALAYA EXP';
        } else if(shipping_gazette_sector.service_id == '2') {
          gazette_service = 'ME1';
        } else if(shipping_gazette_sector.service_id == '3') {
          gazette_service = 'IMED-GEM2';
        } else if(shipping_gazette_sector.service_id == '4') {
          gazette_service = 'IPAK-EPIC1';
        } else if(shipping_gazette_sector.service_id == '5') {
          gazette_service = 'EPIC2-IPAK-2';
        } else if(shipping_gazette_sector.service_id == '6') {
          gazette_service = 'IMEX';
        } else if(shipping_gazette_sector.service_id == '7') {
          gazette_service = 'ME3';
        } else if(shipping_gazette_sector.service_id == '8') {
          gazette_service = 'INDUS EXP';
        } else if(shipping_gazette_sector.service_id == '9') {
          gazette_service = 'MECL1';
        } else if(shipping_gazette_sector.service_id == '10') {
          gazette_service = 'INDAMEX';
        } else if(shipping_gazette_sector.service_id == '11') {
          gazette_service = 'MIDAS LOOP2';
        } else if(shipping_gazette_sector.service_id == '12') {
          gazette_service = 'MESAWA LOOP1';
        } else if(shipping_gazette_sector.service_id == '13') {
          gazette_service = 'MWE';
        } else if(shipping_gazette_sector.service_id == '14') {
          gazette_service = 'SWAX';
        } else if(shipping_gazette_sector.service_id == '15') {
          gazette_service = 'INGWE';
        } else if(shipping_gazette_sector.service_id == '16') {
          gazette_service = 'CIX2-CISC-NCI';
        } else if(shipping_gazette_sector.service_id == '17') {
          gazette_service = 'CI2';
        } else if(shipping_gazette_sector.service_id == '18') {
          gazette_service = 'AIS';
        } else if(shipping_gazette_sector.service_id == '19') {
          gazette_service = 'CIX';
        } else if(shipping_gazette_sector.service_id == '20') {
          gazette_service = 'CI1-AS6-CIX1';
        } else if(shipping_gazette_sector.service_id == '21') {
          gazette_service = 'SCIX';
        } else if(shipping_gazette_sector.service_id == '22') {
          gazette_service = 'CIX3';
        } else if(shipping_gazette_sector.service_id == '23') {
          gazette_service = 'AIS3-CIX3';
        } else if(shipping_gazette_sector.service_id == '24') {
          gazette_service = 'FM3';
        } else if(shipping_gazette_sector.service_id == '25') {
          gazette_service = 'HLS-TIP';
        } else if(shipping_gazette_sector.service_id == '26') {
          gazette_service = 'PS3';
        } else if(shipping_gazette_sector.service_id == '27') {
          gazette_service = 'GALEX';
        } else if(shipping_gazette_sector.service_id == '28') {
          gazette_service = 'NDX';
        } else if(shipping_gazette_sector.service_id == '29') {
          gazette_service = 'NEW IIX SERVICE';
        } else if(shipping_gazette_sector.service_id == '30') {
          gazette_service = 'NMG';
        } else if(shipping_gazette_sector.service_id == '31') {
          gazette_service = 'ASX';
        }
        shipping_gazette_sector_data.service = gazette_service;
        result.shipping_gazette_sector_data.push(shipping_gazette_sector_data);
      });
      result.success = 1;
      return res.status(200).json(result);
    } else {
      let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(500).json(result);
    }
  }).populate('port_id', 'name');
},*/
  // Get Shipping Gazette Sectors Route End

  // Get News Route Start
  meet_expert: function (req, res) {
    let skip = parseInt(req.params.skip);
    let limit = parseInt(req.params.limit);
    MeetExpert.findOne({}, function (err, meet_expert) {
      // today_date = moment().format('YYYY-MM-DD') + "T00:00:00.000Z";
      QuestionAnswer.find(
        {
          /*$and: [{"date": today_date}]*/
        },
        function (err, data) {
          if (err) {
            let result = {};
            result.message = "Something Went Wrong.";
            result.error = err;
            result.success = 0;
            return res.status(500).json(result);
          }
          if (data != "" && data !== null) {
            let result = {};
            result.meet_expert = meet_expert;
            result.question_answers_data = [];
            data.map(function (question_answer) {
              let question_answers_data = {};
              question_answers_data.id = question_answer._id;
              question_answers_data.date = question_answer.date;
              question_answers_data.question = question_answer.question;
              question_answers_data.answer = question_answer.answer;
              result.question_answers_data.push(question_answers_data);
            });
            result.success = 1;
            return res.status(200).json(result);
          } else {
            let result = {};
            result.message = "No Record Found.";
            result.success = 0;
            return res.status(201).json(result);
          }
          /*QuestionAnswer.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data1 != '' && data1 !== null) {
    QuestionAnswer.find({$and: [{"date": data1.date}]}, function(err, data2) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data2 != '' && data2 !== null) {
      let result = {};
      result.meet_expert = meet_expert;
      result.question_answers_data = [];
      data2.map(function(question_answer) {
      let question_answers_data = {};
        question_answers_data.id = question_answer._id;
        question_answers_data.date = question_answer.date;
        question_answers_data.question = question_answer.question;
        question_answers_data.answer = question_answer.answer;
        result.question_answers_data.push(question_answers_data);
      });
        result.success = 1;
        return res.status(200).json(result);
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    });
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).sort({'date': -1});*/
        }
      )
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    }).select("description image -_id");
  },
  // Get News Route End

  // Get Gazette Vessel Route Start
  gazette_vessels: function (req, res) {
    today_date = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";

    // if(req.params.port_id != -1) {
    GazetteVessel.find(
      { $and: [{ date: today_date }, { service_id: req.params.service_id }] },
      function (err, data) {
        GazetteLineAgent.find(
          { $and: [{ service_id: req.params.service_id }] },
          function (err, lines) {
            if (err) {
              let result = {};
              result.message = "Something Went Wrong.";
              result.error = err;
              result.success = 0;
              return res.status(500).json(result);
            }
            if (data != "" && data !== null) {
              let result = {};
              var gazette_vessels_data = {};
              result.gazette_vessels_data = [];
              data.map(function (vessels) {
                // console.log(vessels);return false;
                if (vessels.gazette_sector_id == "1") {
                  var gazette_sector = "EUROPE/GULF";
                } else if (vessels.gazette_sector_id == "2") {
                  gazette_sector = "USA/EUROPE";
                } else if (vessels.gazette_sector_id == "3") {
                  gazette_sector = "GULF/AFRICA";
                } else if (vessels.gazette_sector_id == "4") {
                  gazette_sector = "FAR EAST/INDIAN SUB CONTINENT";
                } else if (vessels.gazette_sector_id == "5") {
                  gazette_sector = "GULF/FAR EAST";
                } else if (vessels.gazette_sector_id == "6") {
                  gazette_sector = "GULF";
                }
                gazette_vessels_data.sector_name = gazette_sector;
                gazette_vessels_data.port_name = vessels.port_id.name;
                if (vessels.service_id == "1") {
                  var gazette_service = "HIMALAYA EXP";
                } else if (vessels.service_id == "2") {
                  gazette_service = "ME1";
                } else if (vessels.service_id == "3") {
                  gazette_service = "IMED-GEM2";
                } else if (vessels.service_id == "4") {
                  gazette_service = "IPAK-EPIC1";
                } else if (vessels.service_id == "5") {
                  gazette_service = "EPIC2-IPAK-2";
                } else if (vessels.service_id == "6") {
                  gazette_service = "IMEX";
                } else if (vessels.service_id == "7") {
                  gazette_service = "ME3";
                } else if (vessels.service_id == "8") {
                  gazette_service = "INDUS EXP";
                } else if (vessels.service_id == "9") {
                  gazette_service = "MECL1";
                } else if (vessels.service_id == "10") {
                  gazette_service = "INDAMEX";
                } else if (vessels.service_id == "11") {
                  gazette_service = "MIDAS LOOP2";
                } else if (vessels.service_id == "12") {
                  gazette_service = "MESAWA LOOP1";
                } else if (vessels.service_id == "13") {
                  gazette_service = "MWE";
                } else if (vessels.service_id == "14") {
                  gazette_service = "SWAX";
                } else if (vessels.service_id == "15") {
                  gazette_service = "INGWE";
                } else if (vessels.service_id == "16") {
                  gazette_service = "CIX2-CISC-NCI";
                } else if (vessels.service_id == "17") {
                  gazette_service = "CI2";
                } else if (vessels.service_id == "18") {
                  gazette_service = "AIS";
                } else if (vessels.service_id == "19") {
                  gazette_service = "CIX";
                } else if (vessels.service_id == "20") {
                  gazette_service = "CI1-AS6-CIX1";
                } else if (vessels.service_id == "21") {
                  gazette_service = "SCIX";
                } else if (vessels.service_id == "22") {
                  gazette_service = "CIX3";
                } else if (vessels.service_id == "23") {
                  gazette_service = "AIS3-CIX3";
                } else if (vessels.service_id == "24") {
                  gazette_service = "FM3";
                } else if (vessels.service_id == "25") {
                  gazette_service = "HLS-TIP";
                } else if (vessels.service_id == "26") {
                  gazette_service = "PS3";
                } else if (vessels.service_id == "27") {
                  gazette_service = "GALEX";
                } else if (vessels.service_id == "28") {
                  gazette_service = "NDX";
                } else if (vessels.service_id == "29") {
                  gazette_service = "NEW IIX SERVICE";
                } else if (vessels.service_id == "30") {
                  gazette_service = "NMG";
                } else if (vessels.service_id == "31") {
                  gazette_service = "ASX";
                }
                gazette_vessels_data.service_name = gazette_service;
                // gazette_vessels_data.item = vessels.item;
                // gazette_vessels_data.desc_one = vessels.desc_one;
                // gazette_vessels_data.desc_two = vessels.desc_two;
                gazette_vessels_data.date = vessels.date;
                gazette_vessels_data[vessels.order + "-" + vessels.item] =
                  vessels.desc_one;
              });
              var ordered = {};
              Object.keys(gazette_vessels_data).forEach(function (key) {
                var split = key.split("-")[1];
                if (split != undefined) {
                  ordered[split] = gazette_vessels_data[key];
                }
              });
              ordered.sector_name = gazette_vessels_data.sector_name;
              ordered.port_name = gazette_vessels_data.port_name;
              ordered.service_name = gazette_vessels_data.service_name;
              ordered.date = gazette_vessels_data.date;
              result.gazette_vessels_data.push(ordered);
              // result.gazette_vessels_data.sort();

              var gazette_vessels_data = {};
              data.map(function (vessels) {
                // console.log(vessels);return false;
                if (vessels.gazette_sector_id == "1") {
                  var gazette_sector = "EUROPE/GULF";
                } else if (vessels.gazette_sector_id == "2") {
                  gazette_sector = "USA/EUROPE";
                } else if (vessels.gazette_sector_id == "3") {
                  gazette_sector = "GULF/AFRICA";
                } else if (vessels.gazette_sector_id == "4") {
                  gazette_sector = "FAR EAST/INDIAN SUB CONTINENT";
                } else if (vessels.gazette_sector_id == "5") {
                  gazette_sector = "GULF/FAR EAST";
                } else if (vessels.gazette_sector_id == "6") {
                  gazette_sector = "GULF";
                }
                gazette_vessels_data.sector_name = gazette_sector;
                gazette_vessels_data.port_name = vessels.port_id.name;
                if (vessels.service_id == "1") {
                  var gazette_service = "HIMALAYA EXP";
                } else if (vessels.service_id == "2") {
                  gazette_service = "ME1";
                } else if (vessels.service_id == "3") {
                  gazette_service = "IMED-GEM2";
                } else if (vessels.service_id == "4") {
                  gazette_service = "IPAK-EPIC1";
                } else if (vessels.service_id == "5") {
                  gazette_service = "EPIC2-IPAK-2";
                } else if (vessels.service_id == "6") {
                  gazette_service = "IMEX";
                } else if (vessels.service_id == "7") {
                  gazette_service = "ME3";
                } else if (vessels.service_id == "8") {
                  gazette_service = "INDUS EXP";
                } else if (vessels.service_id == "9") {
                  gazette_service = "MECL1";
                } else if (vessels.service_id == "10") {
                  gazette_service = "INDAMEX";
                } else if (vessels.service_id == "11") {
                  gazette_service = "MIDAS LOOP2";
                } else if (vessels.service_id == "12") {
                  gazette_service = "MESAWA LOOP1";
                } else if (vessels.service_id == "13") {
                  gazette_service = "MWE";
                } else if (vessels.service_id == "14") {
                  gazette_service = "SWAX";
                } else if (vessels.service_id == "15") {
                  gazette_service = "INGWE";
                } else if (vessels.service_id == "16") {
                  gazette_service = "CIX2-CISC-NCI";
                } else if (vessels.service_id == "17") {
                  gazette_service = "CI2";
                } else if (vessels.service_id == "18") {
                  gazette_service = "AIS";
                } else if (vessels.service_id == "19") {
                  gazette_service = "CIX";
                } else if (vessels.service_id == "20") {
                  gazette_service = "CI1-AS6-CIX1";
                } else if (vessels.service_id == "21") {
                  gazette_service = "SCIX";
                } else if (vessels.service_id == "22") {
                  gazette_service = "CIX3";
                } else if (vessels.service_id == "23") {
                  gazette_service = "AIS3-CIX3";
                } else if (vessels.service_id == "24") {
                  gazette_service = "FM3";
                } else if (vessels.service_id == "25") {
                  gazette_service = "HLS-TIP";
                } else if (vessels.service_id == "26") {
                  gazette_service = "PS3";
                } else if (vessels.service_id == "27") {
                  gazette_service = "GALEX";
                } else if (vessels.service_id == "28") {
                  gazette_service = "NDX";
                } else if (vessels.service_id == "29") {
                  gazette_service = "NEW IIX SERVICE";
                } else if (vessels.service_id == "30") {
                  gazette_service = "NMG";
                } else if (vessels.service_id == "31") {
                  gazette_service = "ASX";
                }
                gazette_vessels_data.service_name = gazette_service;
                // gazette_vessels_data.item = vessels.item;
                // gazette_vessels_data.desc_one = vessels.desc_one;
                // gazette_vessels_data.desc_two = vessels.desc_two;
                gazette_vessels_data.date = vessels.date;
                gazette_vessels_data[vessels.order + "-" + vessels.item] =
                  vessels.desc_two;
              });
              var ordered = {};
              Object.keys(gazette_vessels_data).forEach(function (key) {
                var split = key.split("-")[1];
                if (split != undefined) {
                  ordered[split] = gazette_vessels_data[key];
                }
              });
              ordered.sector_name = gazette_vessels_data.sector_name;
              ordered.port_name = gazette_vessels_data.port_name;
              ordered.service_name = gazette_vessels_data.service_name;
              ordered.date = gazette_vessels_data.date;
              result.gazette_vessels_data.push(ordered);

              result.lines = [];
              lines.map(function (line) {
                let line_data = {};
                line_data.id = line._id;
                line_data.line = line.line;
                result.lines.push(line_data);
              });

              result.success = 1;
              return res.status(200).json(result);
            }
            GazetteVessel.findOne(
              { $and: [{ date: { $lt: today_date } }] },
              function (err, data1) {
                if (err) {
                  let result = {};
                  result.message = "Something Went Wrong.";
                  result.error = err;
                  result.success = 0;
                  return res.status(500).json(result);
                }
                if (data1 != "" && data1 !== null) {
                  GazetteVessel.find(
                    {
                      $and: [
                        { date: data1.date },
                        { service_id: req.params.service_id },
                      ],
                    },
                    function (err, data2) {
                      GazetteLineAgent.find(
                        { $and: [{ service_id: req.params.service_id }] },
                        function (err, lines) {
                          if (err) {
                            let result = {};
                            result.message = "Something Went Wrong.";
                            result.error = err;
                            result.success = 0;
                            return res.status(500).json(result);
                          }
                          if (data2 != "" && data2 !== null) {
                            let result = {};
                            result.gazette_vessels_data = [];
                            var gazette_vessels_data = {};
                            data2.map(function (vessels, ind) {
                              // console.log(vessels);return false;
                              // gazette_vessels_data.id = vessels._id;
                              if (vessels.gazette_sector_id == "1") {
                                var gazette_sector = "EUROPE/GULF";
                              } else if (vessels.gazette_sector_id == "2") {
                                gazette_sector = "USA/EUROPE";
                              } else if (vessels.gazette_sector_id == "3") {
                                gazette_sector = "GULF/AFRICA";
                              } else if (vessels.gazette_sector_id == "4") {
                                gazette_sector =
                                  "FAR EAST/INDIAN SUB CONTINENT";
                              } else if (vessels.gazette_sector_id == "5") {
                                gazette_sector = "GULF/FAR EAST";
                              } else if (vessels.gazette_sector_id == "6") {
                                gazette_sector = "GULF";
                              }
                              gazette_vessels_data.sector_name = gazette_sector;
                              gazette_vessels_data.port_name =
                                vessels.port_id.name;
                              if (vessels.service_id == "1") {
                                var gazette_service = "HIMALAYA EXP";
                              } else if (vessels.service_id == "2") {
                                gazette_service = "ME1";
                              } else if (vessels.service_id == "3") {
                                gazette_service = "IMED-GEM2";
                              } else if (vessels.service_id == "4") {
                                gazette_service = "IPAK-EPIC1";
                              } else if (vessels.service_id == "5") {
                                gazette_service = "EPIC2-IPAK-2";
                              } else if (vessels.service_id == "6") {
                                gazette_service = "IMEX";
                              } else if (vessels.service_id == "7") {
                                gazette_service = "ME3";
                              } else if (vessels.service_id == "8") {
                                gazette_service = "INDUS EXP";
                              } else if (vessels.service_id == "9") {
                                gazette_service = "MECL1";
                              } else if (vessels.service_id == "10") {
                                gazette_service = "INDAMEX";
                              } else if (vessels.service_id == "11") {
                                gazette_service = "MIDAS LOOP2";
                              } else if (vessels.service_id == "12") {
                                gazette_service = "MESAWA LOOP1";
                              } else if (vessels.service_id == "13") {
                                gazette_service = "MWE";
                              } else if (vessels.service_id == "14") {
                                gazette_service = "SWAX";
                              } else if (vessels.service_id == "15") {
                                gazette_service = "INGWE";
                              } else if (vessels.service_id == "16") {
                                gazette_service = "CIX2-CISC-NCI";
                              } else if (vessels.service_id == "17") {
                                gazette_service = "CI2";
                              } else if (vessels.service_id == "18") {
                                gazette_service = "AIS";
                              } else if (vessels.service_id == "19") {
                                gazette_service = "CIX";
                              } else if (vessels.service_id == "20") {
                                gazette_service = "CI1-AS6-CIX1";
                              } else if (vessels.service_id == "21") {
                                gazette_service = "SCIX";
                              } else if (vessels.service_id == "22") {
                                gazette_service = "CIX3";
                              } else if (vessels.service_id == "23") {
                                gazette_service = "AIS3-CIX3";
                              } else if (vessels.service_id == "24") {
                                gazette_service = "FM3";
                              } else if (vessels.service_id == "25") {
                                gazette_service = "HLS-TIP";
                              } else if (vessels.service_id == "26") {
                                gazette_service = "PS3";
                              } else if (vessels.service_id == "27") {
                                gazette_service = "GALEX";
                              } else if (vessels.service_id == "28") {
                                gazette_service = "NDX";
                              } else if (vessels.service_id == "29") {
                                gazette_service = "NEW IIX SERVICE";
                              } else if (vessels.service_id == "30") {
                                gazette_service = "NMG";
                              } else if (vessels.service_id == "31") {
                                gazette_service = "ASX";
                              }
                              gazette_vessels_data.service_name =
                                gazette_service;
                              // gazette_vessels_data.item = vessels.item;
                              // gazette_vessels_data.desc_one = vessels.desc_one;
                              // gazette_vessels_data.desc_two = vessels.desc_two;
                              gazette_vessels_data.date = vessels.date;
                              // gazette_vessels_data[vessels.item] = vessels.desc_one;
                              gazette_vessels_data[
                                vessels.order + "-" + vessels.item
                              ] = vessels.desc_one;
                              // gazette_vessels_data = gazette_vessels_data[vessels.order+'-'+vessels.item].split('-')[1];
                            });
                            var ordered = {};
                            Object.keys(gazette_vessels_data).forEach(function (
                              key
                            ) {
                              var split = key.split("-")[1];
                              if (split != undefined) {
                                ordered[split] = gazette_vessels_data[key];
                              }
                            });
                            ordered.sector_name =
                              gazette_vessels_data.sector_name;
                            ordered.port_name = gazette_vessels_data.port_name;
                            ordered.service_name =
                              gazette_vessels_data.service_name;
                            ordered.date = gazette_vessels_data.date;
                            result.gazette_vessels_data.push(ordered);
                            // result.gazette_vessels_data.sort();

                            var gazette_vessels_data = {};
                            data2.map(function (vessels, ind) {
                              // console.log(vessels);return false;
                              // gazette_vessels_data.id = vessels._id;
                              if (vessels.gazette_sector_id == "1") {
                                var gazette_sector = "EUROPE/GULF";
                              } else if (vessels.gazette_sector_id == "2") {
                                gazette_sector = "USA/EUROPE";
                              } else if (vessels.gazette_sector_id == "3") {
                                gazette_sector = "GULF/AFRICA";
                              } else if (vessels.gazette_sector_id == "4") {
                                gazette_sector =
                                  "FAR EAST/INDIAN SUB CONTINENT";
                              } else if (vessels.gazette_sector_id == "5") {
                                gazette_sector = "GULF/FAR EAST";
                              } else if (vessels.gazette_sector_id == "6") {
                                gazette_sector = "GULF";
                              }
                              gazette_vessels_data.sector_name = gazette_sector;
                              gazette_vessels_data.port_name =
                                vessels.port_id.name;
                              if (vessels.service_id == "1") {
                                var gazette_service = "HIMALAYA EXP";
                              } else if (vessels.service_id == "2") {
                                gazette_service = "ME1";
                              } else if (vessels.service_id == "3") {
                                gazette_service = "IMED-GEM2";
                              } else if (vessels.service_id == "4") {
                                gazette_service = "IPAK-EPIC1";
                              } else if (vessels.service_id == "5") {
                                gazette_service = "EPIC2-IPAK-2";
                              } else if (vessels.service_id == "6") {
                                gazette_service = "IMEX";
                              } else if (vessels.service_id == "7") {
                                gazette_service = "ME3";
                              } else if (vessels.service_id == "8") {
                                gazette_service = "INDUS EXP";
                              } else if (vessels.service_id == "9") {
                                gazette_service = "MECL1";
                              } else if (vessels.service_id == "10") {
                                gazette_service = "INDAMEX";
                              } else if (vessels.service_id == "11") {
                                gazette_service = "MIDAS LOOP2";
                              } else if (vessels.service_id == "12") {
                                gazette_service = "MESAWA LOOP1";
                              } else if (vessels.service_id == "13") {
                                gazette_service = "MWE";
                              } else if (vessels.service_id == "14") {
                                gazette_service = "SWAX";
                              } else if (vessels.service_id == "15") {
                                gazette_service = "INGWE";
                              } else if (vessels.service_id == "16") {
                                gazette_service = "CIX2-CISC-NCI";
                              } else if (vessels.service_id == "17") {
                                gazette_service = "CI2";
                              } else if (vessels.service_id == "18") {
                                gazette_service = "AIS";
                              } else if (vessels.service_id == "19") {
                                gazette_service = "CIX";
                              } else if (vessels.service_id == "20") {
                                gazette_service = "CI1-AS6-CIX1";
                              } else if (vessels.service_id == "21") {
                                gazette_service = "SCIX";
                              } else if (vessels.service_id == "22") {
                                gazette_service = "CIX3";
                              } else if (vessels.service_id == "23") {
                                gazette_service = "AIS3-CIX3";
                              } else if (vessels.service_id == "24") {
                                gazette_service = "FM3";
                              } else if (vessels.service_id == "25") {
                                gazette_service = "HLS-TIP";
                              } else if (vessels.service_id == "26") {
                                gazette_service = "PS3";
                              } else if (vessels.service_id == "27") {
                                gazette_service = "GALEX";
                              } else if (vessels.service_id == "28") {
                                gazette_service = "NDX";
                              } else if (vessels.service_id == "29") {
                                gazette_service = "NEW IIX SERVICE";
                              } else if (vessels.service_id == "30") {
                                gazette_service = "NMG";
                              } else if (vessels.service_id == "31") {
                                gazette_service = "ASX";
                              }
                              gazette_vessels_data.service_name =
                                gazette_service;
                              // gazette_vessels_data.item = vessels.item;
                              // gazette_vessels_data.desc_one = vessels.desc_one;
                              // gazette_vessels_data.desc_two = vessels.desc_two;
                              gazette_vessels_data.date = vessels.date;
                              // gazette_vessels_data[vessels.item] = vessels.desc_two;
                              gazette_vessels_data[
                                vessels.order + "-" + vessels.item
                              ] = vessels.desc_two;
                              // gazette_vessels_data = gazette_vessels_data.split('-')[1];
                            });
                            var ordered = {};
                            Object.keys(gazette_vessels_data).forEach(function (
                              key
                            ) {
                              var split = key.split("-")[1];
                              if (split != undefined) {
                                ordered[split] = gazette_vessels_data[key];
                              }
                            });
                            ordered.sector_name =
                              gazette_vessels_data.sector_name;
                            ordered.port_name = gazette_vessels_data.port_name;
                            ordered.service_name =
                              gazette_vessels_data.service_name;
                            ordered.date = gazette_vessels_data.date;
                            result.gazette_vessels_data.push(ordered);
                            // result.gazette_vessels_data.sort();

                            result.lines = [];
                            lines.map(function (line) {
                              let line_data = {};
                              line_data.id = line._id;
                              line_data.line = line.line;
                              result.lines.push(line_data);
                            });

                            result.success = 1;
                            return res.status(200).json(result);
                          } else {
                            let result = {};
                            result.message = "No Record Found.";
                            result.success = 0;
                            return res.status(201).json(result);
                          }
                        }
                      ).sort({ line: 1 });
                    }
                  )
                    .sort({ order: 1 })
                    .populate("sector_id", "name")
                    .populate("port_id", "name");
                } else {
                  let result = {};
                  result.message = "No Record Found.";
                  result.success = 0;
                  return res.status(201).json(result);
                }
              }
            ).sort({ date: -1 });
          }
        );
      }
    )
      .sort({ order: 1 })
      .populate("sector_id", "name")
      .populate("port_id", "name");
    // }
    /*else {
  Vessel.find({$and: [{"date": today_date}, {"sector_id": req.params.sector_id}]}, function(err, data) {
    // LineAgent.find({$and: [{"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, lines) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data != '' && data !== null) {
       let result = {};
      result.vessels_data = [];
      data.map(function(vessels) {
      let vessels_data = {};
        vessels_data.id = vessels._id;
        vessels_data.sector_name = vessels.sector_id.name;
        vessels_data.port_name = vessels.port_id.name;
        vessels_data.date = vessels.date;
        vessels_data.eta = vessels.eta;
        vessels_data.etd = vessels.etd;
        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;
        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
        vessels_data.voy_no = vessels.voy_no;
        vessels_data.rot_no_date = vessels.rot_no_date;
        // vessels_data.line = vessels.line;
        // vessels_data.agent = vessels.agent;
        // vessels_data.carting_point = vessels.carting_point;
        result.vessels_data.push(vessels_data);
      });

      // result.lines = [];
        // lines.map(function(line) {
        // let line_data = {};
          // line_data.id = line._id;
          // line_data.line = line.line;
          // result.lines.push(line_data);
      // });

      result.success = 1;
      return res.status(200).json(result);
    }
    Vessel.findOne({$and: [{"date": {$lt:today_date}}]}, function(err, data1) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data1 != '' && data1 !== null) {

    Vessel.find({$and: [{"date": data1.date}, {"sector_id": req.params.sector_id}]}, function(err, data2) {
      // LineAgent.find({$and: [{"sector_id": req.params.sector_id}, {"port_id": req.params.port_id}]}, function(err, lines) {
    if(err) {
      let result = {};
      result.message = "Something Went Wrong.";
      result.error = err;
      result.success = 0;
      return res.status(500).json(result);
    }
    if(data2 != '' && data2 !== null) {
       let result = {};
      result.vessels_data = [];
      data2.map(function(vessels) {
      let vessels_data = {};
        vessels_data.id = vessels._id;
        vessels_data.sector_name = vessels.sector_id.name;
        vessels_data.port_name = vessels.port_id.name;
        vessels_data.date = vessels.date;
        vessels_data.eta = vessels.eta;
        vessels_data.etd = vessels.etd;
        vessels_data.cy_cut_off_date_time = vessels.cy_cut_off_date_time;
        vessels_data.vessel_name_via_no = vessels.vessel_name_via_no;
        vessels_data.voy_no = vessels.voy_no;
        vessels_data.rot_no_date = vessels.rot_no_date;
        // vessels_data.line = vessels.line;
        // vessels_data.agent = vessels.agent;
        // vessels_data.carting_point = vessels.carting_point;
        result.vessels_data.push(vessels_data);
      });

      //result.lines = [];
        // lines.map(function(line) {
        // let line_data = {};
          // line_data.id = line._id;
          // line_data.line = line.line;
          // result.lines.push(line_data);
      // });

      result.success = 1;
      return res.status(200).json(result);
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
  // });
    }).populate('sector_id', 'name').populate('port_id', 'name');
    } else {
       let result = {};
      result.message = "No Record Found.";
      result.success = 0;
      return res.status(201).json(result);
    }
    }).sort({'date': -1});
  // });
  }).populate('sector_id', 'name').populate('port_id', 'name');
  }*/
  },
  // Get Gazette Vessel Route End

  // Get Gazette Agent Route Start
  gazette_agent: function (req, res) {
    // console.log(req.params.id);
    GazetteLineAgent.findOne({ _id: req.params.id }, function (err, data) {
      if (err) {
        let result = {};
        result.message = "Something Went Wrong.";
        result.error = err;
        result.success = 0;
        return res.status(500).json(result);
      }
      if (data != "" && data !== null) {
        let result = {};
        result.agent = {};
        let agent = {};
        agent.id = data._id;
        agent.agent = data.agent;
        result.agent = agent;

        result.success = 1;
        return res.status(200).json(result);
      } else {
        let result = {};
        result.message = "No Record Found.";
        result.success = 0;
        return res.status(500).json(result);
      }
    });
  },
  // Get Gazette Agent Route End
};
