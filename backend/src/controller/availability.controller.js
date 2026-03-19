const availabilityService = require("../services/availability.service");

// --- Availability --- //

exports.getAvailabilityByDay = async (req, res) => {
  try {
    const day = parseInt(req.params.day_of_week); // 0-6
    const date = req.query.date;
    const availability = await availabilityService.getAvailability(date, day);
    res.json({ date: date || null, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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