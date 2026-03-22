const bookingService = require("../services/booking.service");
const db = require("../config/db");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const success_url = `${process.env.FRONTEND_URL}/success`;
const cancel_url = `${process.env.FRONTEND_URL}/cancel`;

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, success_url, cancel_url } = req.body;

    if (!items || !success_url || !cancel_url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Map frontend items to Stripe line items
    const line_items = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || "",
        },
        unit_amount: item.price * 100, // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url, 
      cancel_url,  
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