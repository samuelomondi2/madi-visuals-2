const express = require("express");
const controller = require("../controller/booking.controller");

const router = express.Router();

router.post("/pending", controller.createBookingController);       
router.get("/bookings", controller.getBookings);
router.get("/bookings/:id", controller.getBooking);
router.get("/duration/:service_id", controller.getDuration);

module.exports = router;