const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const controller = require("../controller/upload.controller");

router.post('/upload', upload.array('file', 10), controller.uploadFiles);
router.get('/files',controller.getFiles);
// router.delete("/:id", uploadController.deleteFile);

module.exports = router;