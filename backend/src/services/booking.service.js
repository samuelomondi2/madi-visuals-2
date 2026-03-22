const db = require('../config/db');

exports.getDuration = async ({ id }) => {
  const [rows] = await db.query(`SELECT duration FROM services WHERE id = ?`, [id]);
  if (!rows.length) throw new Error('Service not found');
  return rows[0];
};

// Create pending booking (pre-lock)
exports.createPendingBooking = async ({ service_id, booking_date, start_time, client_name, client_email = null, client_phone = null, event_type = null, location = null, notes = null, total_amount = null }) => {
  // Conflict check
  const [service] = await db.query(`SELECT duration FROM services WHERE id = ?`, [service_id]);
  if (!service.length) throw new Error('Service not found');
  const duration = service[0].duration;

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

  if (conflicts.length > 0) throw new Error('Time slot already booked');

  // Insert pending booking
  const [result] = await db.query(
    `INSERT INTO bookings 
    (service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, 'pending']
  );

  return { id: result.insertId, service_id, booking_date, start_time };
};

// Mark booking as paid
exports.markBookingPaid = async ({ bookingId, stripePaymentIntent, amount, type = 'full' }) => {
  await db.query(`UPDATE bookings SET payment_status = 'paid' WHERE id = ?`, [bookingId]);

  await db.query(
    `INSERT INTO payments (booking_id, stripe_payment_intent, amount, type, status) VALUES (?, ?, ?, ?, ?)`,
    [bookingId, stripePaymentIntent, amount, type, 'paid']
  );
};