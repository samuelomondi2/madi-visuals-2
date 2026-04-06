const express = require("express");
const router = express.Router();
const controller = require("../controller/availability.controller");

router.get("/availability", controller.getAvailability);
router.get("/admin/availability", controller.getAdminAvailability);
router.post("/availability", controller.setAdminAvailability);           
router.put("/availability/:day_of_week", controller.updateAvailability); 
router.delete("/availability/:day_of_week", controller.deleteAvailability); 

router.get("/special-days", controller.getSpecialDays);
router.post("/special-days", controller.createSpecialDay);
router.put("/special-days/:id", controller.updateSpecialDay);
router.delete("/special-days/:id", controller.deleteSpecialDay);

module.exports = router;