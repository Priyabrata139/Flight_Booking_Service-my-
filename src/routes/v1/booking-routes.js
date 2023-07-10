const express = require('express');

const { BookingController } = require('../../controllers');
const { BookingMiddlewares } = require('../../middlewares');

const router = express.Router();


// /api/v1/bookings POST
router.post('/', 
        BookingMiddlewares.validateCreateRequest,
        BookingController.createBooking);

// /api/v1/bookings GET
router.get('/', 
        BookingController.getBookings);

// /api/v1/bookings/:id GET
router.get('/:id', 
        BookingController.getBooking);


// /api/v1/bookings/payment POST
router.post('/payment', 
        BookingMiddlewares.validatePaymentRequest,
        BookingController.makePayment);

module.exports = router;