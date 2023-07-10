const { StatusCodes } = require('http-status-codes');

const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateCreateRequest(req, res, next) {
    if(!req.body.flightId) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' flightId is not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if(!req.body.userId) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' userId not is found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if(!req.body.noofSeats) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' noofSeats is not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    next();
}

function validatePaymentRequest(req, res, next) {
    if(!req.body.bookingId) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' bookingId is not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if(!req.body.userId) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' userId not is found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if(!req.body.totalAmmount) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' totalAmmount is not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }


    if(!req.headers.x_idempotent_key) {
        ErrorResponse.message = 'Something went wrong while creating booking';
        ErrorResponse.error = new AppError([' x_idempotent_key is not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateRequest,
    validatePaymentRequest
}