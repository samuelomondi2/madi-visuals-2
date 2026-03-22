require("dotenv").config();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    // List products (just to test API key)
    const products = await stripe.products.list({ limit: 1 });
    console.log("Stripe API Key is working ✅", products.data.length, "product(s) found");
  } catch (err) {
    console.error("Stripe API Key test failed ❌", err.message);
  }
})();