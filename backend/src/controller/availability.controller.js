const availabilityService = require("../services/availability.service");

export const getAvailability = async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) return res.status(400).json({ message: "Date is required" });
  
      const availability = await availabilityService.getAvailability(date);
      res.json({ date, services: availability });
    } catch (err) {
      console.error("GET availability error:", err);
      res.status(500).json({ message: err.message });
    }
};