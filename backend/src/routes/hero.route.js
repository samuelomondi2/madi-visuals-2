const express = require("express");
const controller = require("../controller/hero.controller");

const router = express.Router();

router.post("/hero", controller.createHero);
router.get("/hero", controller.getHero);

// Update text
router.put("/hero/:id", controller.updateHeroContent);

// Update image only
router.patch("/hero/image/latest", controller.updateHeroImage);

module.exports = router;