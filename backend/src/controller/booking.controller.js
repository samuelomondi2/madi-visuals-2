const bookingService = require("../services/booking.service");

exports.createBookingController = async (req, res) => {
  try {
    const requiredFields = ['service_id', 'booking_date', 'start_time', 'client_name'];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const booking = await bookingService.createBooking(req.body);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

module.exports = { createBookingController };