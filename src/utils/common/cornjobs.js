var cron = require('node-cron');

const {BookingRepository} = require('../../repositories')
const bookingRepository = new BookingRepository();

const {BookingService} = require('../../services')


function corns() {
    cron.schedule('*/1800 * * * * *', async () => {
        console.log('running a task every 30 min minute');
        await BookingService.cancellOldBookings();
      });
}

module.exports = corns;