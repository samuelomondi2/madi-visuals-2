const express = require("express");
const controller = require("../controller/hero.controller");

const router = express.Router();

router.post("/", controller.createHero);
router.get("/", controller.getHero);

// Update text
router.put("/:id", controller.updateHeroContent);

// Update image only
router.patch("/:id/image", controller.updateHeroImage);

module.exports = router;