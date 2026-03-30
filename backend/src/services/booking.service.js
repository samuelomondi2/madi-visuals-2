const db = require("../config/db");

exports.createBooking = async (data) => {
  const [result] = await db.query(
    `INSERT INTO bookings 
    (service_id, booking_date, start_time, client_name, client_email, client_phone, location, notes, total_amount, payment_status, agreed_to_terms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.service_id,
      data.booking_date,
      data.start_time,
      data.client_name,
      data.client_email,
      data.client_phone,
      data.location,
      data.notes,
      data.total_amount,
      data.payment_status,
      data.agreed_to_terms
    ]
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

exports.deleteBookingById = async (id) => {
  const [result] = await db.query(
    "DELETE FROM bookings WHERE id = ?",
    [id]
  );

  return result.affectedRows;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [bookingsToday] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM bookings 
       WHERE booking_date = ?`,
      [today]
    );

    const [revenueToday] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM bookings 
       WHERE booking_date = ? 
       AND payment_status = 'paid'`,
      [today]
    );

    const [totalBookings] = await db.execute(
      `SELECT COUNT(*) as count FROM bookings`
    );

    const [totalRevenue] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM bookings 
       WHERE payment_status = 'paid'`
    );

    res.json({
      today_bookings: bookingsToday[0].count,
      today_revenue: revenueToday[0].total,
      total_bookings: totalBookings[0].count,
      total_revenue: totalRevenue[0].total,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: err.message });
  }
};