const express = require("express");
const controller = require("../controller/services.controller");
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get("/services", authenticateToken, controller.getServices);
router.get("/services/:id", authenticateToken, controller.getService);
router.post("/services", authenticateToken, controller.addService);
router.patch("/services/:id", authenticateToken, controller.updateService);

module.exports = router;
