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
  
      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: booking.client_email,
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
  
      res.status(200).json({ url: session.url  });
    } catch (err) {
      console.error("Stripe session error:", err);
      res.status(500).json({ message: err.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
  console.log("⚡ Webhook hit");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("Buffer:", Buffer.isBuffer(req.body));
    console.log("Type:", typeof req.body);
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Event verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (!session.metadata?.booking_id) {
      console.warn("⚠️ Missing booking_id in metadata");
      return res.sendStatus(200);
    }

    console.log("💰 Payment success for booking:", session.metadata);

    const bookingId = session.metadata.booking_id;

    await db.execute(
      `UPDATE bookings 
       SET payment_status='paid', expires_at=NULL 
       WHERE id=?`,
      [bookingId]
    );
  }

  res.sendStatus(200);
};