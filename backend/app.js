require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./src/config/cors');
const bodyParser = require('body-parser');

const authRoutes = require('./src/routes/auth.route');
const protectedRoutes = require('./src/routes/protected.route');

const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Hello, Node.js JWT Auth!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
