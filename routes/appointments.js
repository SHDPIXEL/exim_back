const express = require('express');
const router = express.Router();

// Bring in Appointments Contoller
let appointments = require('../controllers/appointments');

// Appointments List Route Start
router.get('/list', is_authenticated, appointments.list);
// Appointments List Route End

// Get Appointments Route Start
router.post('/get_appointments', appointments.get_appointments);
router.post('/get_appointment_website', appointments.get_appointments_website);
router.post('/get_allappointment', appointments.get_allappointments);
router.post('/search_appointments', appointments.search_appointments);
router.post('/get_latest_appointments', appointments.getLatestAppointments);
// Get Appointments Route End

// Appointment Add Route Start
router.get('/add', is_authenticated, appointments.add);
// Appointment Add Route End

// Appointment Store Route Start
router.post('/store', appointments.store);
// Appointment Store Route End

// Appointment Edit Route Start
router.get('/edit/:id', is_authenticated, appointments.edit);
// Appointment Edit Route End

// Appointment Update Route Start
router.put('/update/:id', appointments.update);
// Appointment Update Route End

// Appointment Delete Route Start
router.delete('/delete/:id', appointments.delete);
// Appointment Delete Route End

// Fetch Appointments Route Start
// router.get('/fetch_appointments', appointments.fetch_appointments);
// Fetch Appointments Route End

// Access Control Start
function is_authenticated(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.role != 'vessel_user') {
        return next();
    } else {
        req.flash('msg', 'You Dont have Permission.');
        return res.redirect('/dashboard');
      }
  } else {
    req.flash('msg', 'Please Login First');
    return res.redirect('/users/login');
  }
}
// Access Control End

module.exports = router;
