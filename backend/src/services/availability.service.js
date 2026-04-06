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

exports.getAdminAvailability = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM admin_availability"
  );
  return rows;
};

exports.getAvailability = async (date) => {
  if (!date) throw new Error("Date is required");
  const requestedDate = new Date(date);
  if (isNaN(requestedDate)) throw new Error("Invalid date format");

  const dayOfWeek = requestedDate.getDay() || 7; // 1 = Monday ... 7 = Sunday
  const today = new Date();
  const isToday = requestedDate.toDateString() === today.toDateString();
  const nowMs = today.getTime();

  // 1️⃣ Admin hours
  const [hours] = await db.execute(
    "SELECT start_time, end_time FROM admin_availability WHERE day_of_week=?",
    [dayOfWeek]
  );
  if (!hours.length) return [];

  let { start_time, end_time } = hours[0];

  // 2️⃣ Special Days (full-day blocking with recurring support)
  const [specialDays] = await db.execute(
    `SELECT date, day_of_week, is_recurring, is_closed
     FROM special_days
     WHERE date = ?
        OR (is_recurring = 1 AND date IS NOT NULL AND MONTH(date) = MONTH(?) AND DAY(date) = DAY(?))
        OR (is_recurring = 1 AND day_of_week = ?)`,
    [date, date, date, dayOfWeek]
  );

  if (specialDays.length) {
    const isClosed = specialDays.some(s => s.is_closed);
    if (isClosed) return []; // Entire day blocked
  }

  // 3️⃣ Breaks
  const [breaks] = await db.execute(
    "SELECT start_time, end_time FROM admin_breaks WHERE day_of_week=?",
    [dayOfWeek]
  );

  const BUFFER_MINUTES = 60;
  const addBuffer = (time, minutes) => {
    const d = new Date(`1970-01-01T${time}`);
    d.setMinutes(d.getMinutes() + minutes);
    if (d.getHours() < 0) return "00:00:00";
    if (d.getHours() >= 24) return "23:59:59";
    return d.toTimeString().slice(0, 8);
  };

  // 4️⃣ Existing bookings
  const [rawBookings] = await db.execute(
    `SELECT 
        b.service_id,
        b.start_time,
        ADDTIME(b.start_time, SEC_TO_TIME(s.duration * 60)) AS end_time
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.booking_date = ?
       AND (b.payment_status = 'paid' OR (b.payment_status = 'pending' AND b.expires_at > NOW()))`,
    [date]
  );

  // 5️⃣ Blocked times
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

  const normalizeTime = (time) => (!time ? "00:00:00" : time.length === 5 ? `${time}:00` : time);

  const blocked = [...allBookings, ...breaks, ...blockedTimes].map(b => ({
    start_time: normalizeTime(b.start_time),
    end_time: normalizeTime(b.end_time)
  }));

  const services = await servicesService.getAllServices();
  const availability = [];
  const SLOT_INTERVAL_MINUTES = 15;

  const baseSlots = generateSlots(start_time, end_time, SLOT_INTERVAL_MINUTES * 60 * 1000, date);

  for (const service of services) {
    const durationMs = (service.duration ?? 30) * 60 * 1000;

    const slots = baseSlots.map(slot => ({
      start: slot.start,
      end: new Date(new Date(`${date}T${slot.start}:00`).getTime() + durationMs)
        .toTimeString()
        .slice(0, 8)
    }));

    const freeSlots = slots
      .map(slot => ({
        ...slot,
        slotMs: new Date(`${date}T${slot.start}:00`).getTime()
      }))
      .filter(slot => !isToday || slot.slotMs > nowMs)
      .filter(slot => slot.end <= end_time)
      .filter(slot => !blocked.some(b => isOverlap(slot.start, slot.end, b.start_time, b.end_time)))
      .map(slot => slot.start);

    availability.push({
      id: service.id,
      name: service.name,
      available_slots: freeSlots
    });
  }

  return availability;
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

// --- Special Days --- //
exports.getSpecialDays = async (date) => {
  const dayOfWeek = new Date(date).getDay() || 7; // 1=Monday ... 7=Sunday
  const [rows] = await db.execute(
    `SELECT *
     FROM special_days
     WHERE date = ?
        OR (is_recurring = 1 AND date IS NOT NULL AND MONTH(date) = MONTH(?) AND DAY(date) = DAY(?))
        OR (is_recurring = 1 AND day_of_week = ?)`,
    [date, date, date, dayOfWeek]
  );
  return rows;
};

exports.createSpecialDays = async ({ date = null, day_of_week = null, is_recurring = false, is_closed = true, reason = null }) => {
  if (!date && !day_of_week) throw new Error("Either date or day_of_week must be provided");

  const [result] = await db.execute(
    `INSERT INTO special_days (date, day_of_week, is_recurring, is_closed, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [date, day_of_week, is_recurring ? 1 : 0, is_closed ? 1 : 0, reason]
  );
  return { id: result.insertId };
};

exports.updateSpecialDays = async (id, { date, day_of_week, is_recurring, is_closed, reason }) => {
  const [result] = await db.execute(
    `UPDATE special_days
     SET date = ?, day_of_week = ?, is_recurring = ?, is_closed = ?, reason = ?
     WHERE id = ?`,
    [date, day_of_week, is_recurring ? 1 : 0, is_closed ? 1 : 0, reason, id]
  );
  return { affectedRows: result.affectedRows };
};

exports.deleteSpecialDays = async (id) => {
  const [result] = await db.execute(
    `DELETE FROM special_days WHERE id = ?`,
    [id]
  );
  return { affectedRows: result.affectedRows };
};
