const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Public booking request endpoint
router.post('/', bookingController.createBooking);

module.exports = router;
