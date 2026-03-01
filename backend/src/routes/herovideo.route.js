const express = require("express");
const controller = require("../controller/herovideo.controllerr");

const router = express.Router();

router.post("/hero-video", controller.createHeroVideo);
router.get("/hero-video", controller.getHeroVideo);

module.exports = router;