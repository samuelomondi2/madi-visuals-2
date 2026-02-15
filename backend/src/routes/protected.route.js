const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email} to your dashboard` });
});

module.exports = router;
