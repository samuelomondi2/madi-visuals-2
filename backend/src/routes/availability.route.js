const express = require("express");
const controller = require("../controller/availability.controller");

const router = express.Router();

router.get("/availability", controller.getAvailability);
router.post("/availability", controller.setAdminAvailability);

module.exports = router;
