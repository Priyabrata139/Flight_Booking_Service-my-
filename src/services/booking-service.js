const { StatusCodes } = require("http-status-codes");

const axios = require("axios");

var jwt = require('jsonwebtoken');


const { Booking } = require("../models");

const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const { ServerConfig } = require("../config");

const inMemDb = {};

const db = require("../models");
const { PENDING, BOOKED, CANCELLED } = require("../utils/common/enum");

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const t = await db.sequelize.transaction();

  try {
    // console.log(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
    let flight;
    try {
      flight = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
      );
    } catch (error) {
      console.log(error);
      // throw error;
      if (error.code == "ECONNREFUSED") {
        throw new AppError(
          ["flights service is currently not responding"],
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      throw new AppError(
        error.response.data.error.explanation,
        error.response.data.error.statusCode
      );
    }

    const flightData = flight.data.data;
    const userId = data.userId;
    const noofSeats = data.noofSeats;

    if (noofSeats > flightData.totalSeats) {
      throw new AppError(
        ["Not enough seats available"],
        StatusCodes.BAD_REQUEST
      );
    }

    const totalCost = noofSeats * flightData.price;
    let bookingPayload = {};
    bookingPayload.flightId = data.flightId;
    bookingPayload.userId = userId;
    bookingPayload.noofSeats = noofSeats;
    bookingPayload.totalCost = totalCost;
    console.log(bookingPayload);
    
    const booking = await bookingRepository.create(bookingPayload, t);
    const token = jwt.sign({
      data: booking
    }, ServerConfig.JWT_SECRET, { expiresIn: '1h' });


    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: noofSeats,
       
      },
      {
        headers: {
          jwt_token : token, jwt_secret_key : ServerConfig.JWT_SECRET
          }
      }
    );
    // console.log(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`);
    // console.log(updateSeats);

    await t.commit();

    return flight.data.data;

    // return booking;
  } catch (error) {
    // console.log(error.response.data.error);
    // console.log(error.response.data.error);
    await t.rollback();
    console.log(error);
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

async function getBookings() {
  try {
    const bookings = await bookingRepository.getAll();
    return bookings;
  } catch (error) {
    throw new AppError(
      "Cannot fetch data of all the bookings",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getBooking(id) {
  try {
    const booking = await bookingRepository.get(id);
    return booking;
  } catch (error) {
    console.log(error);
    if (error.statusCode == StatusCodes.NOT_FOUND) {
      throw new AppError(
        "The booking you requested is not present",
        error.statusCode
      );
    }
    throw new AppError(
      "Cannot fetch data of all the bookin",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function makePayment(data) {
  // console.log(data.idempotentKey);
  if (inMemDb[data.idempotentKey]) {
    throw new AppError(
      ["Cannot retry on a successful payment"],
      StatusCodes.BAD_REQUEST
    );
  }

  const t = await db.sequelize.transaction();

  try {
    const booking = await bookingRepository.get(data.bookingId, t);
    if (booking.status == CANCELLED) {
      throw new AppError(["The booking is expired"], StatusCodes.BAD_REQUEST);
    }

    const currentTime = new Date();
    const bookingTime = booking.createdAt;

    if (currentTime - bookingTime >= 30000000) {
      await cancellBooking(data.bookingId);
      throw new AppError(["The booking is expired"], StatusCodes.BAD_REQUEST);
    }
    if (booking.userId != data.userId) {
      throw new AppError(
        ["userId does't match with this booking "],
        StatusCodes.BAD_REQUEST
      );
    }
    if (booking.totalCost != data.totalAmmount) {
      throw new AppError(
        ["totalAmmount does't match with this booking "],
        StatusCodes.BAD_REQUEST
      );
    }

    // here we are assuming payment is done my the 3rd party payment gateway
    const response = await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      t
    );
    inMemDb[data.idempotentKey] = data.idempotentKey;
    await t.commit();
    return response;
  } catch (error) {
    await t.rollback();

    if (error.code == "ECONNREFUSED") {
      throw new AppError(
        ["flights service is currently not responding"],
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    throw error;
  }
}

async function cancellBooking(bookingId) {
  const t1 = await db.sequelize.transaction();
  try {
    const booking = await bookingRepository.get(bookingId, t1);
    await bookingRepository.update(bookingId, { status: CANCELLED }, t1);
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`
    );
    const flightData = flight.data.data;
    const noofSeats = booking.noofSeats;

    
    const token = jwt.sign({
      data: booking
    }, ServerConfig.JWT_SECRET, { expiresIn: '1h' });

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${flightData.id}/seats`,
      {
        seats: noofSeats,
        dec: false,
      },
      {
        headers: {
          jwt_token : token, jwt_secret_key : ServerConfig.JWT_SECRET
          }
      }
    );

    await t1.commit();
  } catch (error) {
    await t1.rollback();

    throw error;
  }
}

async function cancellOldBookings() {
  const t = await db.sequelize.transaction();
  try {
    const currentTime = new Date();
    const safeTime = new Date(currentTime.getTime() - 5 * 60000);
    const oldBookings = await bookingRepository.getOldBookings(t, safeTime);

    if (oldBookings.length > 0) {
      console.log(oldBookings);
      oldBookings.forEach(async (booking) => {
        await cancellBooking(booking.id);
      });
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  makePayment,
  cancellOldBookings,
};
