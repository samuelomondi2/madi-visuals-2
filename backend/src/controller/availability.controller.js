const availabilityService = require("../services/availability.service");
const db = require("../config/db");

exports.setAdminAvailability = async (req, res) => {
  try {

    const schedule = req.body;

    await availabilityService.setAdminAvailability(schedule);

    res.json({ message: "Availability updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

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
};

exports.updateAvailability = async (req, res) => {
  try {
    const { id, start_time, end_time, enabled } = req.body;

    await availabilityService.updateAvailability({id, start_time, end_time, enabled});

    res.json({ message: "Availability Updated"})
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
}

exports.getAllBreaks = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM admin_breaks ORDER BY day_of_week");
    res.json({ breaks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveBreaks = async (req, res) => {
  try {
    const breaks = req.body; // expect array [{day_of_week, start_time, end_time}, ...]
    for (const b of breaks) {
      if (!b.start_time || !b.end_time) continue;
      await db.execute(
        `REPLACE INTO admin_breaks (day_of_week, start_time, end_time) VALUES (?, ?, ?)`,
        [b.day_of_week, b.start_time, b.end_time]
      );
    }
    res.json({ message: "Breaks updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSpecialDays = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM special_days ORDER BY date");
    res.json({ special_days: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveSpecialDays = async (req, res) => {
  try {
    const days = req.body; // expect array [{date, start_time, end_time, is_closed}, ...]
    for (const d of days) {
      await db.execute(
        `REPLACE INTO special_days (date, day_of_week, start_time, end_time, is_closed)
         VALUES (?, ?, ?, ?, ?)`,
        [d.date, new Date(d.date).getDay(), d.start_time, d.end_time, d.is_closed ? 1 : 0]
      );
    }
    res.json({ message: "Special days updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
