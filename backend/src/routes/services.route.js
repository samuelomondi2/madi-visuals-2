const express = require("express");
const controller = require("../controller/services.controller");

const router = express.Router();

router.get("/services", controller.getServices);
router.get("/services/:id", controller.getService);

module.exports = router;
