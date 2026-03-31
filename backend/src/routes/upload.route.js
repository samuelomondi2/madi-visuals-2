const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const controller = require("../controller/upload.controller");

router.post('/upload', upload.array('files', 10), controller.uploadFiles);
router.get('/files',controller.getFiles);
router.post("/media/set-hero", controller.setHero);
router.get("/media/hero", controller.getHero);
router.delete("/delete/:id", uploadController.deleteFile);

module.exports = router;