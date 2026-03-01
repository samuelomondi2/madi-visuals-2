const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined/null values

module.exports = cors({
  origin: function (origin, callback) {
    console.log('Incoming origin:', origin);
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});


console.log('Allowed origins:', allowedOrigins);

