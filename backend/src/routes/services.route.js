const express = require("express");
const controller = require("../controller/services.controller");

const router = express.Router();

router.get("/services", controller.getServices);
router.get("/services/:id", controller.getService);
router.post("/services", controller.addService);
router.patch("/services/:id", controller.updateService);

module.exports = router;
