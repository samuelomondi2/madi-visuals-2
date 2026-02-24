const express = require('express');
const controller = require('../controller/contact.controller');
const contactLimiter = require("../middleware/contact.middleware");

const router = express.Router();

router.post('/contact', contactLimiter, controller.contact);
router.get('/contact', controller.getContacts);

module.exports = router;