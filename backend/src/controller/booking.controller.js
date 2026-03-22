const bookingService = require("../services/booking.service");

exports.createPendingBookingController = async (req, res) => {
  try {
    const {
      service_id,
      booking_date,
      start_time,
      client_name,
      client_email = null,
      client_phone = null,
      event_type = null,
      location = null,
      notes = null
    } = req.body;

    if (!service_id || !booking_date || !start_time || !client_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch service info (including duration & price)
    const service = await bookingService.getDuration({ id: service_id });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Optional: if your services table has price
    const total_amount = service.price || 100; // fallback or dynamic

    // Attempt to create pending booking
    const booking = await bookingService.createBooking({
      service_id,
      booking_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      event_type,
      location,
      notes,
      total_amount,
      payment_status: "pending"
    });

    res.status(201).json({ booking });
  } catch (err) {
    console.error("Pending booking error:", err);
    res.status(500).json({ message: err.message || "Failed to create pending booking" });
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