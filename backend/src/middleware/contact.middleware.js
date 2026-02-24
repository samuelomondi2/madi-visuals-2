import rateLimit from "express-rate-limit";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: {
    error: "Too many messages sent. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = contactLimiter;