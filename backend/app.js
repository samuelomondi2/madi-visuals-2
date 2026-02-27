require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./src/config/cors');
const bodyParser = require('body-parser');

const authRoutes = require('./src/routes/auth.route');
const protectedRoutes = require('./src/routes/protected.route');
const conctactRoute = require('./src/routes/contact.route')
const heroRoute = require("./src/routes/hero.route");

const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', conctactRoute)
app.use('/api', protectedRoutes);
app.use('/api', heroRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
