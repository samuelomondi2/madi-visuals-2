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

exports.getBookings = async (req, res) => {
  try {
    const results = await bookingService.getAllBookings();
    res.status(200).json({ results })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await bookingService.getABooking({ id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getDuration = async (req, res) => {
  try {
    const { id } = req.params;

    const duration = await bookingService.getDuration({ id });

    if (!duration) {
      return res.status(404).json({ message: 'duration not found' });
    }

    res.status(200).json(duration); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};