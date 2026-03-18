const express = require("express");
const controller = require("../controller/availability.controller");

const router = express.Router();

router.get("/availability", controller.getAvailability);
router.post("/availability", controller.setAdminAvailability);
router.get("/breaks", controller.getAllBreaks);
router.post("/breaks", controller.saveBreaks);
router.get("/special_days", controller.getAllSpecialDays);
router.post("/special_days", controller.saveSpecialDays);

module.exports = router;
