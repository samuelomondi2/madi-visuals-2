const express = require('express');
const controller = require('../controller/auth.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
});

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', limiter, controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
