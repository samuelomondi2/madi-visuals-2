const bookingService = require("../services/booking.service");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const success_url = `${process.env.FRONTEND_URL}/success`;
const cancel_url = `${process.env.FRONTEND_URL}/cancel`;

exports.createBookingController = async (req, res) => {
  try {
    const { service_id, booking_date, start_time, client_name } = req.body;
    if (!service_id || !booking_date || !start_time || !client_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create booking with status = 'pending'
    const booking = await bookingService.createBooking({
      service_id,
      booking_date,
      start_time,
      client_name,
      payment_status: "pending",
    });

    // Stripe Checkout session
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Booking #${booking.id}` },
          unit_amount: 100 * 100, // amount in cents
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url,
      cancel_url,
      metadata: { booking_id: booking.id },
    });

    res.status(201).json({
      booking,
      checkoutSessionId: session.id,
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