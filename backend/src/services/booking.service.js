const db = require('../config/db'); // Your MySQL connection

exports.createBooking = async (bookingData) => {
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
    payment_status
  } = bookingData;

  const query = `
    INSERT INTO bookings 
      (service_id, booking_date, start_time, end_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    service_id,
    booking_date,
    start_time,
    end_time,
    client_name,
    client_email || null,
    client_phone || null,
    event_type || null,
    location || null,
    notes || null,
    total_amount || null,
    payment_status || 'pending'
  ];

  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, ...bookingData });
    });
  });
};
