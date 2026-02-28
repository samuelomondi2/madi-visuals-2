const express = require('express');
const router = express.Router();
const uploadController = require('../controller/upload.controller');

router.post('/upload', uploadController);

module.exports = router;