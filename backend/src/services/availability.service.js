const db = require("../config/db");
const servicesService = require("./services.service");
const {generateSlots, isOverlap} = require("../middleware/util.middleware")

exports.setAdminAvailability = async (req, res) => {

  const schedule = req.body;

  for (const day of schedule) {

    if (!day.enabled) {
      await db.execute(
        "DELETE FROM admin_availability WHERE day_of_week=?",
        [day.id]
      );
      continue;
    }

    await db.execute(
      `REPLACE INTO admin_availability (day_of_week,start_time,end_time)
       VALUES (?,?,?)`,
      [day.id, day.start_time, day.end_time]
    );
  }

  res.json({ success: true });
};

// exports.setAdminAvailability = async (day, start, end) => {
//   await db.execute(
//     `INSERT INTO admin_availability (day_of_week, start_time, end_time)
//      VALUES (?, ?, ?)
//      ON DUPLICATE KEY UPDATE start_time=?, end_time=?`,
//     [day, start, end, start, end]
//   );
// };

exports.getAvailability = async (date) => {

  const services = await servicesService.getAllServices();
  const day = new Date(date).getDay();

  const [hours] = await db.execute(
    "SELECT start_time,end_time FROM admin_availability WHERE day_of_week=?",
    [day]
  );

  if (!hours.length) return [];

  const { start_time, end_time } = hours[0];

  const [breaks] = await db.execute(
    "SELECT start_time,end_time FROM admin_breaks WHERE day_of_week=?",
    [day]
  );

  const availability = [];

  for (const service of services) {

    const duration = service.duration_minutes * 60000;

    const slots = generateSlots(start_time, end_time, duration, date);

    const [bookings] = await db.execute(
      `SELECT start_time,end_time
       FROM bookings
       WHERE booking_date=? AND service_id=?`,
      [date, service.id]
    );

    const blocked = [...bookings, ...breaks];

    const freeSlots = slots
      .filter(slot => {
        return !blocked.some(b =>
          isOverlap(slot.start, slot.end, b.start_time, b.end_time)
        );
      })
      .map(slot => slot.start);

    availability.push({
      id: service.id,
      name: service.name,
      available_slots: freeSlots
    });
  }

  return availability;
};

// export const getAvailability = async (date) => {

//   const services = await servicesService.getAllServices();

//   const day = new Date(date).getDay();

//   // check special day
//   const [special] = await db.execute(
//     "SELECT * FROM special_days WHERE date = ?",
//     [date]
//   );

//   if (special.length && special[0].is_closed) return [];

//   let startTime, endTime;

//   if (special.length) {
//     startTime = special[0].start_time;
//     endTime = special[0].end_time;
//   } else {

//     const [hours] = await db.execute(
//       "SELECT start_time, end_time FROM working_hours WHERE day_of_week = ?",
//       [day]
//     );

//     if (!hours.length) return [];

//     startTime = hours[0].start_time;
//     endTime = hours[0].end_time;
//   }

//   const [breaks] = await db.execute(
//     "SELECT start_time, end_time FROM breaks WHERE day_of_week = ?",
//     [day]
//   );

//   const availability = [];

//   for (const service of services) {

//     const [bookings] = await db.execute(
//       `SELECT start_time, end_time
//        FROM bookings
//        WHERE booking_date = ? AND service_id = ?`,
//       [date, service.id]
//     );

//     const slots = [];

//     let current = new Date(`${date}T${startTime}`);
//     const end = new Date(`${date}T${endTime}`);

//     const duration = service.duration_minutes * 60 * 1000;

//     while (current.getTime() + duration <= end.getTime()) {

//       const slotStart = current.toTimeString().slice(0,5);
//       const slotEnd = new Date(current.getTime() + duration)
//         .toTimeString().slice(0,5);

//       const bookingConflict = bookings.some(
//         b => slotStart < b.end_time && slotEnd > b.start_time
//       );

//       const breakConflict = breaks.some(
//         b => slotStart < b.end_time && slotEnd > b.start_time
//       );

//       if (!bookingConflict && !breakConflict) {
//         slots.push(slotStart);
//       }

//       current = new Date(current.getTime() + duration);
//     }

//     availability.push({
//       id: service.id,
//       name: service.name,
//       available_slots: slots
//     });
//   }

//   return availability;
// };