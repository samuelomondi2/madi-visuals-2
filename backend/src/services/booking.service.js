const db = require("../config/db");

exports.createBooking = async (data) => {
  const [result] = await db.query(
    `INSERT INTO bookings (service_id, booking_date, start_time, client_name, client_email, client_phone, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.service_id, data.booking_date, data.start_time, data.client_name, data.client_email, data.client_phone, data.location, data.notes]
  );
  return { id: result.insertId, ...data };
};

exports.getAllBookings = async () => {
  const [rows] = await db.query("SELECT * FROM bookings");
  return rows;
};

exports.getBookingById = async (id) => {
  const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0];
};

exports.markBookingPaid = async (bookingId, paymentIntent) => {
  await db.query(
    `UPDATE bookings SET payment_status = 'paid' WHERE id = ?`,
    [bookingId]
  );

  await db.query(
    `INSERT INTO payments (booking_id, stripe_payment_intent, amount, type, status)
     SELECT id, ?, total_amount, 'full', 'paid' FROM bookings WHERE id = ?`,
    [paymentIntent, bookingId]
  );
};