const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

/**
 * POST : /bookings
 * req-body {userId: 1}
 */
async function createBooking(req, res) {
    try {
        const booking = await BookingService.createBooking({
            userId: req.body.userId,
           
        });
        SuccessResponse.data = booking;
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}


/**
 * POST : /bookings
 * req-body {}
 */
async function getBookings(req, res) {
    try {
        const bookings = await BookingService.getBookings();
        SuccessResponse.data = bookings;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

/**
 * POST : /bookings/:id 
 * req-body {}
 */
async function getBooking(req, res) {
    try {
        const booking = await BookingService.getBooking(req.params.id);
        SuccessResponse.data = booking;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    getBookings,
    getBooking
}