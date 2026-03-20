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

exports.getAvailability = async (date) => {
  if (!date) throw new Error("Date is required");

  const services = await servicesService.getAllServices();
  const day = new Date(date).getDay();

  // 1️⃣ Admin hours
  const [hours] = await db.execute(
    "SELECT start_time, end_time FROM admin_availability WHERE day_of_week=?",
    [day]
  );

  if (!hours.length) return [];

  let { start_time, end_time } = hours[0];

  // 2️⃣ Special days
  const [specialDays] = await db.execute(
    "SELECT start_time, end_time, is_closed FROM special_days WHERE date=?",
    [date]
  );

  if (specialDays.length) {
    const special = specialDays[0];
    if (special.is_closed) return [];
    start_time = special.start_time;
    end_time = special.end_time;
  }

  // 3️⃣ Breaks
  const [breaks] = await db.execute(
    "SELECT start_time, end_time FROM admin_breaks WHERE day_of_week=?",
    [day]
  );

  // 🔥 4️⃣ Fetch ALL bookings ONCE
  const [allBookings] = await db.execute(
    `SELECT 
        b.service_id,
        b.start_time,
        ADDTIME(b.start_time, SEC_TO_TIME(s.duration * 60)) AS end_time
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.booking_date=?`,
    [date]
  );

  const availability = [];

  // 5️⃣ Loop services
  for (const service of services) {
    const durationMinutes = service.duration ?? 30;
    const durationMs = durationMinutes * 60 * 1000;

    const slots = generateSlots(start_time, end_time, durationMs, date);

    // ✅ Filter bookings per service
    const bookings = allBookings.filter(
      b => b.service_id === service.id
    );

    // Combine blocked times
    const blocked = [...bookings, ...breaks];

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