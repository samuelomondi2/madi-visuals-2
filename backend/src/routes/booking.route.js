const express = require("express");
const controller = require("../controller/booking.controller");

const router = express.Router();

// Create pending booking (pre-lock slot)
router.post("/pending", controller.createPendingBookingController);

router.get("/", controller.getBookings);
router.get("/:id", controller.getBooking);
router.get("/duration/:service_id", controller.getDuration);

module.exports = router;