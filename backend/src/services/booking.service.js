const db = require('../config/db');

exports.createBooking = async (bookingData) => {
  const {
    service_id,
    booking_date,
    start_time,
    client_name,
    client_email,
    client_phone,
    event_type,
    location,
    notes,
    total_amount,
    payment_status
  } = bookingData;

  // 1. Get service duration
  const service = await new Promise((resolve, reject) => {
    db.query(
      `SELECT duration FROM services WHERE id = ?`,
      [service_id],
      (err, results) => {
        if (err) return reject(err);
        if (!results.length) return reject(new Error('Service not found'));
        resolve(results[0]);
      }
    );
  });

  const duration = service.duration;

  // 2. Compute end time
  const { end_time } = await new Promise((resolve, reject) => {
    db.query(
      `SELECT ADDTIME(?, SEC_TO_TIME(? * 60)) AS end_time`,
      [start_time, duration],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });

  // 3. 🔥 Check for conflicts (EXECUTE IT)
  const conflicts = await new Promise((resolve, reject) => {
    db.query(
      `SELECT b.id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.service_id = ?
       AND b.booking_date = ?
       AND (
         TIME(?) < ADDTIME(b.start_time, SEC_TO_TIME(s.duration * 60))
         AND ADDTIME(?, SEC_TO_TIME(? * 60)) > b.start_time
       )`,
      [service_id, booking_date, start_time, start_time, duration],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });

  if (conflicts.length > 0) {
    throw new Error('Time slot already booked');
  }

  // 4. Insert booking
  const result = await new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO bookings 
      (service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service_id,
        booking_date,
        start_time,
        client_name,
        client_email || null,
        client_phone || null,
        event_type || null,
        location || null,
        notes || null,
        total_amount || null,
        payment_status || 'pending'
      ],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });

  return {
    id: result.insertId,
    ...bookingData,
    computed_end_time: end_time
  };
};