const { StatusCodes } = require("http-status-codes");

const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");


async function isAdminOrFlightCompany(req, res, next) {
  var userRoles = req.headers["user-roles"];

  userRoles = userRoles.split(",");

  for (role of userRoles) {
    if (role === " admin" || role === "flight_company") {
      console.log("executing next()");
      next();
      return;
    }
  }

  console.log("executeing after next");
  ErrorResponse.message = "Only Admin or Flight-Company can do this operation";
  ErrorResponse.error = new AppError(
    ["Unauthorized access"],
    StatusCodes.BAD_REQUEST
  );
  return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
}

async function isAdmin(req, res, next) {
    var userRoles = req.headers["user-roles"];
  
    userRoles = userRoles.split(",");
  
    for (role of userRoles) {
      if (role === " admin") {
        console.log("executing next()");
        next();
        return;
      }
    }
  
    console.log("executeing after next");
    ErrorResponse.message = "Only Admin can do this operation";
    ErrorResponse.error = new AppError(
      ["Unauthorized access"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
  }

  async function isAdminOrFlightCompanyOrUser(req, res, next) {
    var userRoles = req.headers["user-roles"];
  
    userRoles = userRoles.split(",");
  
    for (role of userRoles) {
      if (role === " admin" || role === "flight_company") {
        console.log("executing next()");
        next();
        return;
      }
    }
    if (req.params.id == req.headers['user']) {
      next(); 
      return;
    }

  
    console.log("executeing after next");
    ErrorResponse.message = "Only Admin or Flight-Company can see the other's bookings";
    ErrorResponse.error = new AppError(
      ["Unauthorized access"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
  }

module.exports = {
  isAdminOrFlightCompanyOrUser,
  isAdminOrFlightCompany,
  isAdmin
};
