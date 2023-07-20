const { StatusCodes } = require("http-status-codes");

const { BookingService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

/**
 * POST : /bookings
 * req-body {userId: 1}
 */
async function createBooking(req, res) {
  console.log('inside controller');
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noofSeats: req.body.noofSeats,
    });
    SuccessResponse.data = booking;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /bookings
 * req-body {}
 */
async function getBookings(req, res) {
  // console.log(req.headers['user'], req.headers['user-roles']);
  try {
    const bookings = await BookingService.getBookings();
    SuccessResponse.data = bookings;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
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
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /bookings/payment
 * req-body {userId: 1, bookingId:3, totalAmmount: 13000}
 */
async function makePayment(req, res) {
  try {
    const payment = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      totalAmmount: req.body.totalAmmount,
      idempotentKey: req.headers["x_idempotent_key"],
    });
    SuccessResponse.data = payment;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  makePayment,
};
