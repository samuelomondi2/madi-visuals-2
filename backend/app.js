require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./src/config/cors');
const bodyParser = require('body-parser');
const path = require("path");

const authRoutes = require('./src/routes/auth.route');
const protectedRoutes = require('./src/routes/protected.route');
const conctactRoute = require('./src/routes/contact.route')
const heroRoute = require("./src/routes/hero.route");
const uploadRoutes = require("./src/routes/upload.route");
const heroVideoRoutes = require("./src/routes/herovideo.route");
const serviceRoutes = require("./src/routes/services.route");
const availabilityRoutes = require("./src/routes/availability.route");
const bookingRoutes = require("./src/routes/booking.route");
const adminEmail = require("./src/routes/adminEmailRoutes");
const paymentRoutes = require("./src/routes/payments.route");
const dashboardStatsRoute = require("./src/routes/dashboardStats.route");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', conctactRoute)
app.use('/api', protectedRoutes);
app.use('/api', heroRoute);
app.use('/api', heroVideoRoutes);
app.use('/api', serviceRoutes);
app.use('/api', availabilityRoutes);
app.use('/api', bookingRoutes);
app.use('/api', adminEmail);
app.use('/api', paymentRoutes);
app.use('/api', dashboardStatsRoute);
app.use('/api', uploadRoutes);

app.use(errorHandler);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
