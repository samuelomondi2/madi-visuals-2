const db = require("../config/db");
const servicesService = require("./services.service");
const {generateSlots, isOverlap} = require("../middleware/util.middleware")

exports.setAdminAvailability = async (schedule) => {

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

  return true;
};

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

    const duration = service.duration * 60000;

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