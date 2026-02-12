require('dotenv').config();
const express = require('express');
// const cors = require('cors')
const corsMiddleware = require('./src/config/cors');

const db = require('./src/config/db');

const app = express();

app.use(corsMiddleware);
// app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Node.js startup project!');
});

module.exports = app;