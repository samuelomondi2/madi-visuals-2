const availabilityService = require("../services/availability.service");

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

exports.getAdminAvailability = async (req, res) => {
  try {
    const times = await availabilityService.getAdminAvailability(); 
    res.status(200).json({ times });
  } catch (error) {
    console.error("GET availability error:", error); 
    res.status(500).json({ message: error.message }); 
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

exports.checkSlotAvailability = async (service_id, booking_date, start_time) => {
  const availability = await availabilityService.getAvailability(booking_date);

  const serviceAvailability = availability.find(s => s.id === service_id);

  if (!serviceAvailability) return false;

  return serviceAvailability.available_slots.includes(start_time);
};

exports.getSpecialDays = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    const specialDays = await availabilityService.getSpecialDays(date);
    return res.json(specialDays);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createSpecialDay = async (req, res) => {
  try {
    const { date, day_of_week, is_recurring, is_closed, reason } = req.body;

    if (!date && !day_of_week) {
      return res.status(400).json({ error: "Either date or day_of_week must be provided" });
    }

    const result = await availabilityService.createSpecialDays({
      date,
      day_of_week,
      is_recurring,
      is_closed,
      reason
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSpecialDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, day_of_week, is_recurring, is_closed, reason } = req.body;

    const result = await availabilityService.updateSpecialDays(id, {
      date,
      day_of_week,
      is_recurring,
      is_closed,
      reason
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Special day not found" });
    }

    return res.json({ message: "Special day updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSpecialDay = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await availabilityService.deleteSpecialDays(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Special day not found" });
    }

    return res.json({ message: "Special day deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};