const bookingService = require("../services/booking.service");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");

const success_url = `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
const cancel_url = `${process.env.FRONTEND_URL}/cancel`;

exports.createBookingController = async (req, res) => {
  try {
    const {
      service_id,
      booking_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      location,
      notes
    } = req.body;

    if (!service_id || !booking_date || !start_time || !client_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const [services] = await db.query(
      "SELECT base_price, name FROM services WHERE id = ?",
      [service_id]
    );

    if (!services.length) {
      return res.status(400).json({ message: "Service not found" });
    }

    const service = services[0];

    const booking = await bookingService.createBooking({
      service_id,
      booking_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      location,
      notes,
      total_amount: service.base_price,
      payment_status: "pending",
    });

    // 💳 Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Booking #${booking.id}` },
            unit_amount: booking.total_amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: { booking_id: booking.id },
    });

    res.status(201).json({
      booking,
      checkoutUrl: session.url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.json(bookings);
};

exports.getBooking = async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};