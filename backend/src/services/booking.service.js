const db = require("../config/db");

exports.getDuration = async ({ id }) => {
  try {
    const [rows] = await db.query(
      `SELECT duration, price FROM services WHERE id = ?`,
      [id]
    );
    if (!rows.length) throw new Error("Service not found");
    return { duration: rows[0].duration, price: rows[0].price };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.createBooking = async (bookingData) => {
  const {
    service_id,
    booking_date,
    start_time,
    client_name,
    client_email = null,
    client_phone = null,
    event_type = null,
    location = null,
    notes = null,
    total_amount = null,
    payment_status = "pending",
  } = bookingData;

  // 1️⃣ Fetch service details
  const service = await exports.getDuration({ id: service_id });
  if (!service || service.duration == null) {
    throw new Error("Service not found or invalid duration");
  }
  const duration = service.duration;

  // 2️⃣ Compute end time
  const [hours, minutes] = start_time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHour = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const endMinute = (totalMinutes % 60).toString().padStart(2, "0");
  const computed_end_time = `${endHour}:${endMinute}:00`;

  // 3️⃣ Conflict check
  const [conflicts] = await db.query(
    `SELECT b.id
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.service_id = ?
       AND b.booking_date = ?
       AND (
         TIME(?) < ADDTIME(b.start_time, SEC_TO_TIME(s.duration * 60))
         AND ADDTIME(?, SEC_TO_TIME(? * 60)) > b.start_time
       )`,
    [service_id, booking_date, start_time, start_time, duration]
  );

  if (conflicts.length > 0) throw new Error("Time slot already booked");

  // 4️⃣ Insert booking
  const [result] = await db.query(
    `INSERT INTO bookings 
      (service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      service_id,
      booking_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      event_type,
      location,
      notes,
      total_amount ?? service.price ?? 0,
      payment_status,
    ]
  );

  return {
    id: result.insertId,
    computed_end_time,
    ...bookingData,
  };
};