const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const uploadController = require("../controller/upload.controller");

router.post('/upload', upload.single('file'), uploadController.uploadFile);
router.delete("/:id", uploadController.deleteFile);

module.exports = router;