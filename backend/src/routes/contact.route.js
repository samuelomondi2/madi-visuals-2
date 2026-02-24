const express = require('express');
const controller = require('../controller/contact.controller');

const router = express.Router();

router.post('/contact', controller.contact);
router.get('/contact', controller.getContacts);

module.exports = router;