const express = require("express");
const controller = require("../controller/payments.controller");

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  controller.handleStripeWebhook
);

export default router;