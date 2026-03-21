const db = require('../config/db');
const bookingService = require("../controller/booking.controller");

exports.getDuration = async ({id}) => {
  try {
    const [rows] = await db.query(
      `SELECT duration FROM services WHERE id = ?`, [id]
    );
    if (!rows.length) {
      throw new Error('Service not found');
    }
    return { duration: rows[0].duration }; 
  } catch (error) {
    console.error(error);
    throw error;
  }
}

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
    payment_status = 'pending'
  } = bookingData;

  console.log('Fetching service...');
  console.log('service_id:', service_id);

  const service = await bookingService.getDuration({ id: service_id });

  console.log("duration", service);

  if (!service || service.duration == null) {
    throw new Error('Service not found or invalid duration');
  }

  const duration = service.duration;

  let computed_end_time;

  try {
    console.log('Computing end time...');
    const [hours, minutes] = start_time.split(':').map(Number);

    const totalMinutes = hours * 60 + minutes + duration;
    const endHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMinute = (totalMinutes % 60).toString().padStart(2, '0');

    // ✅ FIXED
    computed_end_time = `${endHour}:${endMinute}:00`;

    console.log('Computed end time:', computed_end_time);
  } catch (err) {
    console.error('Error computing end time:', err);
    throw err;
  }

  console.log('Checking conflicts...');

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

  if (conflicts.length > 0) throw new Error('Time slot already booked');

  console.log('Inserting booking...');

  const result = await new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO bookings 
      (service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service_id, booking_date, start_time, client_name, client_email, client_phone, event_type, location, notes, total_amount, payment_status],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });

  return {
    id: result.insertId,
    ...bookingData,
    computed_end_time
  };
};

exports.getAllBookings = async () => {
  try {
    const [results] = await db.query(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    )
    return results
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.getABooking = async ({ id }) => {
  try {
    const [results] = await db.query(
      `SELECT * FROM bookings WHERE id = ?`, [id]
    )
    return results[0]
  } catch (error) {
    console.error(error);
    throw error;
  }
}