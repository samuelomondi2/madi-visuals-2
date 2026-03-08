const express = require("express");
const controller = require("../controller/booking.controller");

const router = express.Router();

router.post("/bookings", controller.createBooking);
router.get("/bookings", controller.getBookings);
router.get("/bookings/:id", controller.getBooking);

export default router;