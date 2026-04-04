const db = require("../config/db");
const servicesService = require("./services.service");
const { generateSlots, isOverlap } = require("../middleware/util.middleware");

exports.setAdminAvailability = async (schedule) => {
  for (const day of schedule) {
    if (!day.enabled) {
      await db.execute(
        "DELETE FROM admin_availability WHERE day_of_week=?",
        [day.id]
      );
      continue;
    }

    const toTime = (t) => new Date(`1970-01-01T${t}`);

    if (toTime(day.start_time) >= toTime(day.end_time)) {
      throw new Error(`Invalid time range for day ${day.id}`);
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
  const toTime = (t) => new Date(`1970-01-01T${t}`);

  if (toTime(start_time) >= toTime(end_time)) {
    throw new Error("Invalid time range");
  }

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


exports.getAdminAvailability = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM admin_availability ORDER BY day_of_week ASC"
  );
  return rows;
};

exports.getAvailability = async (date) => {
  if (!date) throw new Error("Date is required");

  if (isNaN(new Date(date))) {
    throw new Error("Invalid date format");
  }

  const services = await servicesService.getAllServices();
  const day = new Date(date).getDay();
  const now = new Date();
  const today = new Date();
  const isToday = new Date(date).toDateString() === today.toDateString();
  const nowMs = today.getTime();

  // 1️⃣ Admin hours
  const [hours] = await db.execute(
    "SELECT start_time, end_time FROM admin_availability WHERE day_of_week=?",
    [day]
  );

  if (!hours.length) return [];

  let { start_time, end_time } = hours[0];

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

  const BUFFER_MINUTES = 15;

  const addBuffer = (time, minutes) => {
    const date = new Date(`1970-01-01T${time}`);
    date.setMinutes(date.getMinutes() + minutes);
  
    if (date.getHours() < 0) return "00:00:00";
  
    if (date.getHours() >= 24) return "23:59:59";
  
    return date.toTimeString().slice(0, 8);
  };

  const [rawBookings] = await db.execute(
    `SELECT 
        b.service_id,
        b.start_time,
        ADDTIME(b.start_time, SEC_TO_TIME(s.duration * 60)) AS end_time
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.booking_date = ?
    AND (
      b.payment_status = 'paid'
      OR (b.payment_status = 'pending' AND b.expires_at > NOW())
    )`,
    [date]
  );

  const [blockedTimes] = await db.execute(
    "SELECT start_time, end_time FROM blocked_times WHERE date=?",
    [date]
  );

  const toTime = (t) => new Date(`1970-01-01T${t}`);

  const clampTime = (time, min, max) => {
    const t = toTime(time);
    const minT = toTime(min);
    const maxT = toTime(max);

    if (t < minT) return min;
    if (t > maxT) return max;
    return time;
  };

  const allBookings = rawBookings.map(b => ({
    ...b,
    start_time: clampTime(addBuffer(b.start_time, -BUFFER_MINUTES), start_time, end_time),
    end_time: clampTime(addBuffer(b.end_time, BUFFER_MINUTES), start_time, end_time)
  }));

  const availability = [];

  const SLOT_INTERVAL_MINUTES = 15;

  const baseSlots = generateSlots(
    start_time,
    end_time,
    SLOT_INTERVAL_MINUTES * 60 * 1000,
    date
  );

  const normalizeTime = (time) => {
    if (!time) return "00:00:00";
    return time.length === 5 ? `${time}:00` : time;
  };

  const blocked = [...allBookings, ...breaks, ...blockedTimes].map(b => ({
    start_time: normalizeTime(b.start_time),
    end_time: normalizeTime(b.end_time)
  }));

  for (const service of services) {
    const durationMinutes = service.duration ?? 30;
    const durationMs = durationMinutes * 60 * 1000;

    const slots = baseSlots.map(slot => ({
      start: slot.start,
      end: new Date(new Date(`${date}T${slot.start}:00`).getTime() + durationMs)
        .toTimeString()
        .slice(0, 8)
    }));

    const nowMs = new Date().getTime();

    const freeSlots = slots
      .map(slot => ({
        ...slot,
        slotMs: new Date(`${date}T${slot.start}:00`).getTime()
      }))
      .filter(slot => !isToday || slot.slotMs > nowMs) 
      .filter(slot => slot.end <= end_time)
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

exports.createBreak = async ({ day_of_week, start_time, end_time }) => {
  const [existing] = await db.execute(
    `SELECT * FROM admin_breaks
     WHERE day_of_week = ?
     AND start_time < ?
     AND end_time > ?`,
    [day_of_week, end_time, start_time]
  );
  
  if (existing.length) {
    throw new Error("Break overlaps with existing break");
  }

  await db.execute(
    `INSERT INTO admin_breaks (day_of_week, start_time, end_time)
     VALUES (?, ?, ?)`,
    [day_of_week, start_time, end_time]
  );
};