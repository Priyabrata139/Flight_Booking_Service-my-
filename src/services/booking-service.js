const {StatusCodes} = require('http-status-codes');

const { BookingRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');


const bookingRepository = new BookingRepository();

async function createBooking(data) {
    try {
        const booking = await bookingRepository.create(data);
        return booking;
    } catch(error) {
        if(error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new Booking object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getBookings() {
    try {
        const bookings = await bookingRepository.getAll();
        return bookings;
    } catch(error) {
        throw new AppError('Cannot fetch data of all the bookings', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getBooking(id) {
    try {
        const booking = await bookingRepository.get(id);
        return booking;
    } catch(error) {
        if(error.statusCode == StatusCodes.NOT_FOUND) {
            throw new AppError('The booking you requested is not present', error.statusCode);
        }
        throw new AppError('Cannot fetch data of all the bookin', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
 
module.exports = {
    createBooking,
    getBooking,
    getBookings
}