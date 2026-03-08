const db = require("../config/db");

// Create a new booking
export const createBooking = async (bookingData) => {
  const {
    service_id,
    booking_date,
    start_time,
    end_time,
    client_name,
    client_email,
    client_phone,
    event_type,
    location,
    notes,
    total_amount,
    payment_status,
  } = bookingData;

  const [result] = await db.execute(
    `INSERT INTO bookings
    (service_id, booking_date, start_time, end_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      service_id,
      booking_date,
      start_time,
      end_time,
      client_name,
      client_email,
      client_phone,
      event_type,
      location,
      notes,
      total_amount,
      payment_status || "pending",
    ]
  );

  return result.insertId;
};

// Get all bookings (optional, for admin)
export const getAllBookings = async () => {
  const [rows] = await pool.query("SELECT * FROM bookings ORDER BY booking_date DESC, start_time ASC");
  return rows;
};

// Get booking by ID
export const getBookingById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0] || null;
};