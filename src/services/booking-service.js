const { StatusCodes } = require("http-status-codes");

const axios = require("axios");

const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const { ServerConfig } = require("../config");

const db = require("../models");
const { PENDING } = require("../utils/common/enum");

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
    const booking = await bookingRepository.create(bookingPayload);
    const updateSeats = await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: noofSeats,
      }
    );
    // console.log(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`);
    // console.log(updateSeats);

    t.commit();

    return flight.data.data;

    // return booking;
  } catch (error) {
    // console.log(error.response.data.error);
    // console.log(error.response.data.error);
    t.rollback();
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

module.exports = {
  createBooking,
  getBooking,
  getBookings,
};
