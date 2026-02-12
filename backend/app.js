require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./src/config/cors');

const db = require('./src/config/db');

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Node.js startup project!');
});

// app.js (or wherever your routes are)
app.get('/users', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM users');
      res.status(200).json({
        success: true,
        data: rows
      });
    } catch (err) {
      console.error('❌ Failed to fetch users:', err.message);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });  

module.exports = app;