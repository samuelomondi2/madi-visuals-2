const express = require("express");
const router = express.Router();
const controller = require("../controller/availability.controller");

router.get("/availability", controller.getAvailability);
router.post("/availability", controller.setAdminAvailability);           
router.put("/availability/:day_of_week", controller.updateAvailability); 
router.delete("/availability/:day_of_week", controller.deleteAvailability); 

router.get("/breaks/:day_of_week", controller.getBreaksByDay);
router.post("/breaks", controller.saveBreaks);        
router.put("/breaks/:id", controller.updateBreak);   
router.delete("/breaks/:id", controller.deleteBreak);

module.exports = router;