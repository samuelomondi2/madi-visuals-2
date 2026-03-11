const bookingService = require("../services/booking.service");

// POST /bookings
exports.createBooking = async (req, res) => {
  try {
    const bookingId = await bookingService.createBooking(req.body);

    // TODO: send email & SMS confirmation

    res.status(201).json({
      success: true,
      booking_id: bookingId,
      message: "Booking created. Pending payment.",
    });
  } catch (err) {
    console.error("CREATE booking error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings (admin)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json({ bookings });
  } catch (err) {
    console.error("GET bookings error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ booking });
  } catch (err) {
    console.error("GET booking error:", err);
    res.status(500).json({ message: err.message });
  }
};