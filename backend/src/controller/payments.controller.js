const bookingService = require("../services/booking.service");
const db = require("../config/db");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // must be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle checkout.session.completed events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Prevent duplicate processing for the same payment_intent
      const [existingPayments] = await db.query(
        `SELECT id FROM payments WHERE stripe_payment_intent = ?`,
        [session.payment_intent]
      );

      if (existingPayments.length > 0) {
        // Already processed this payment
        return res.status(200).send("Already processed");
      }

      const bookingId = session.metadata.booking_id;

      // Mark the booking paid
      await db.query(
        `UPDATE bookings SET payment_status = 'paid' WHERE id = ?`,
        [bookingId]
      );

      // Insert the payment record
      await db.query(
        `INSERT INTO payments
          (booking_id, stripe_payment_intent, amount, type, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          bookingId,
          session.payment_intent,
          session.amount_total / 100, // convert cents to dollars
          "full",
          "paid",
        ]
      );

      console.log(`Booking ${bookingId} marked as paid and recorded in payments.`);
    } catch (err) {
      console.error("Webhook processing failed:", err);
      return res.status(500).send("Webhook handler error");
    }
  }

  // Acknowledge receipt of the event
  res.sendStatus(200);
};