const availabilityService = require("../services/availability.service");

// --- Availability --- //
exports.getAvailability = async (req, res) => { 
  try { 
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Date is required" }); 
    const availability = await availabilityService.getAvailability(date); 
    res.json({ date, services: availability }); 
  } catch (err) { 
    console.error("GET availability error:", err); 
    res.status(500).json({ message: err.message }); 
  }
}

exports.setAdminAvailability = async (req, res) => {
  try {
    const { schedule } = req.body;
    await availabilityService.setAdminAvailability(schedule);
    res.json({ message: "Weekly schedule saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const day_of_week = parseInt(req.params.day_of_week);
    const { start_time, end_time, enabled } = req.body;

    await availabilityService.updateAvailability({ 
      id: day_of_week,
      start_time,
      end_time,
      enabled
    });

    res.json({ message: "Availability updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const day_of_week = parseInt(req.params.day_of_week);
    await availabilityService.updateAvailability({ id: day_of_week, enabled: false });
    res.json({ message: "Availability removed/disabled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Breaks --- //

exports.getBreaksByDay = async (req, res) => {
  try {
    const day_of_week = parseInt(req.params.day_of_week);
    const breaks = await availabilityService.getBreaks(day_of_week);
    res.json({ breaks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBreak = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { start_time, end_time } = req.body;
    await availabilityService.updateBreak({ id, start_time, end_time });
    res.json({ message: "Break updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBreak = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await availabilityService.deleteBreak(id);
    res.json({ message: "Break deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};