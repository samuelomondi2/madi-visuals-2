const express = require("express");
const router = express.Router();

const heroController = require("../controller/hero.controller");
const upload = require("../middleware/upload.middleware");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

router.get("/", heroController.getHero);

router.put(
  "/text",
  authenticateToken,
  isAdmin,
  heroController.updateHeroText
);

router.put(
  "/image",
  authenticateToken,
  isAdmin,
  upload.single("file"),
  heroController.updateHeroImage
);

module.exports = router;