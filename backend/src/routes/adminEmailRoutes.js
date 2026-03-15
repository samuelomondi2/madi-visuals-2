
const express = require("express");
const router = express.Router();
const controller = require("../controller/adminEmailController");

router.get("/email", controller.getEmailDetails);
router.post("/email", controller.updateEmailDetails);

module.exports = router;
