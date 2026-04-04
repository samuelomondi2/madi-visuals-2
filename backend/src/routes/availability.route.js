const express = require("express");
const router = express.Router();
const controller = require("../controller/availability.controller");

router.get("/availability", controller.getAvailability);
router.get("/admin/availability", controller.getAvailability);
router.post("/availability", controller.setAdminAvailability);           
router.put("/availability/:day_of_week", controller.updateAvailability); 
router.delete("/availability/:day_of_week", controller.deleteAvailability); 

module.exports = router;