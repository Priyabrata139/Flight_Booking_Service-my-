const CrudRepository = require("./crud-repository");

const { Booking } = require("../models");
const { Op } = require("sequelize");
const { BOOKED, CANCELLED } = require("../utils/common/enum");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async create(data, transaction) {
    const response = await this.model.create(data, {
      transaction: transaction,
    });
    return response;
  }

  async get(id, transaction) {
    const response = await Booking.findByPk(id, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not able to fund the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    // data -> {col: value, ....}
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
      transaction: transaction,
    });
    return response;
  }

  async cancellOldBookings(timeStamp) {
    const response = await Booking.update(data, {
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.lt]: timeStamp
            }
          },
          {
            status: {
              [Op.ne]: BOOKED
            }
          },
          {
            status: {
              [Op.ne]: CANCELLED
            }
          }
        ]
      }
    });
    return response;
  }


  async getOldBookings(transaction, timeStamp){
    const response = await Booking.findAll({
      where : {
        [Op.and] : [
          {
            createdAt : {
              [Op.lt] : timeStamp 
            },
          },
          {
            status : {
              [Op.ne] : BOOKED
            },
          },
          {
            status : {
              [Op.ne] : CANCELLED
            }
          }
        ]
      },
      transaction : transaction
    });
    return response;
  }
}

module.exports = BookingRepository;
