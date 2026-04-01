const express = require('express');
const controller = require('../controller/contact.controller');
const contactLimiter = require("../middleware/contact.middleware");

const router = express.Router();

router.post('/contact', controller.contact);
router.get('/contact', controller.getContacts);
router.patch('/contact/:id', controller.reviewedContact);
router.patch('/contact/:id/delete', controller.deleteContact);

module.exports = router;