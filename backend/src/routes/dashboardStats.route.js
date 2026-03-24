const express = require('express');
const service = require('../services/booking.service');

const router = express.Router();

router.get('/dashboard/stats', contactLimiter, service.getDashboardStats);

module.exports = router;