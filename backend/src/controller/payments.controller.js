const bookingService = require("../services/booking.service");
const db = require("../config/db");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const success_url = `${process.env.FRONTEND_URL}/success`;
const cancel_url = `${process.env.FRONTEND_URL}/cancel`;

exports.createCheckoutSession = async (req, res) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return res.status(400).json({ message: "Missing required fields" });
  
      // Fetch the booking to get price & name
      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
  
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
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: { booking_id: booking.id },
      });
  
      res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.error("Stripe session error:", err);
      res.status(500).json({ message: err.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.booking_id;

    try {
      await bookingService.markBookingPaid(bookingId, session.payment_intent);
      console.log(`Booking ${bookingId} marked as paid`);
    } catch (err) {
      return res.status(500).send("Webhook handler error");
    }
  }

  res.sendStatus(200);
};