const db = require("../config/db");
const servicesService = require("./services.service");
const { generateSlots, isOverlap } = require("../middleware/util.middleware");

// --- Weekly schedule --- //

exports.setAdminAvailability = async (schedule) => {
  for (const day of schedule) {
    if (!day.enabled) {
      await db.execute(
        "DELETE FROM admin_availability WHERE day_of_week=?",
        [day.id]
      );
      continue;
    }

    await db.execute(
      `INSERT INTO admin_availability (day_of_week, start_time, end_time)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time)`,
      [day.id, day.start_time, day.end_time]
    );
  }
  return true;
};

exports.updateAvailability = async ({ id, start_time, end_time, enabled }) => {
  if (!enabled) {
    await db.execute(
      "DELETE FROM admin_availability WHERE day_of_week=?",
      [id]
    );
    return true;
  }

  await db.execute(
    `INSERT INTO admin_availability (day_of_week, start_time, end_time)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time)`,
    [id, start_time, end_time]
  );

  return true;
};

// --- Breaks --- //

exports.getBreaks = async (day_of_week) => {
  const [rows] = await db.execute(
    "SELECT id, start_time, end_time FROM admin_breaks WHERE day_of_week=?",
    [day_of_week]
  );
  return rows;
};

exports.updateBreak = async ({ id, start_time, end_time }) => {
  await db.execute(
    `UPDATE admin_breaks SET start_time=?, end_time=? WHERE id=?`,
    [start_time, end_time, id]
  );
  return true;
};

exports.deleteBreak = async (id) => {
  await db.execute("DELETE FROM admin_breaks WHERE id=?", [id]);
  return true;
};

// --- Get availability for a date --- //

exports.getAvailability = async (date, day_of_week = null) => {
  const services = await servicesService.getAllServices();
  const day = day_of_week ?? new Date(date).getDay();

  // Get admin hours
  const [hours] = await db.execute(
    "SELECT start_time, end_time FROM admin_availability WHERE day_of_week=?",
    [day]
  );

  if (!hours.length) {
    console.log(`No admin availability for day_of_week=${day}`);
    return [];
  }

  let { start_time, end_time } = hours[0];

  // Check special day override
  const [specialDays] = await db.execute(
    "SELECT start_time, end_time, is_closed FROM special_days WHERE date=?",
    [date]
  );

  if (specialDays.length) {
    const special = specialDays[0];
    if (special.is_closed) return []; // closed
    start_time = special.start_time;
    end_time = special.end_time;
  }

  // Get breaks
  const [breaks] = await db.execute(
    "SELECT start_time, end_time FROM admin_breaks WHERE day_of_week=?",
    [day]
  );

  const availability = [];

  for (const service of services) {
    const durationMinutes = service.duration ?? 30;
    const durationMs = durationMinutes * 60000;

    // Generate slots
    const slots = generateSlots(start_time, end_time, durationMs, date);

    // Get bookings
    const [bookings] = await db.execute(
      "SELECT start_time, end_time FROM bookings WHERE booking_date=? AND service_id=?",
      [date, service.id]
    );

    const blocked = [...bookings, ...breaks];

    // Filter out overlapping slots
    const freeSlots = slots
      .filter(slot =>
        !blocked.some(b =>
          isOverlap(slot.start, slot.end, b.start_time, b.end_time)
        )
      )
      .map(slot => slot.start);

    availability.push({
      id: service.id,
      name: service.name,
      available_slots: freeSlots
    });
  }

  return availability;
};