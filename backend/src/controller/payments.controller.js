const bookingService = require("../services/booking.service");
const db = require("../config/db");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const body = req.rawBody;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.booking_id;

    // Idempotency check
    const [existing] = await db.query(`SELECT id FROM payments WHERE stripe_payment_intent = ?`, [session.payment_intent]);
    if (existing.length > 0) return res.status(200).send("Already processed");

    try {
      await bookingService.markBookingPaid({
        bookingId,
        stripePaymentIntent: session.payment_intent,
        amount: session.amount_total / 100
      });
    } catch (err) {
      console.error("Failed to mark booking paid:", err);
    }
  }

  res.status(200).send("OK");
};