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

// Serve static files
// Host Media on Your Own Server (Node.js Static Folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
