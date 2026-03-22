const bookingService = require("../services/booking.service");

// Create pending booking (pre-lock)
exports.createPendingBookingController = async (req, res) => {
  try {
    const pendingBooking = await bookingService.createPendingBooking(req.body);
    res.status(200).json({ success: true, booking: pendingBooking });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await bookingService.getABooking({ id: req.params.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDuration = async (req, res) => {
  try {
    const duration = await bookingService.getDuration({ id: req.params.service_id });
    res.status(200).json(duration);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};