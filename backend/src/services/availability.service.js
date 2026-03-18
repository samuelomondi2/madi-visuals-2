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

  // Get admin hours for the day
  const [hours] = await db.execute(
    "SELECT start_time,end_time FROM admin_availability WHERE day_of_week=?",
    [day]
  );

  if (!hours.length) {
    console.log(`No admin availability set for day_of_week=${day}`);
    return [];
  }

  const { start_time, end_time } = hours[0];
  console.log("Admin hours:", start_time, "-", end_time);

  // Get breaks for the day
  const [breaks] = await db.execute(
    "SELECT start_time,end_time FROM admin_breaks WHERE day_of_week=?",
    [day]
  );
  console.log("Breaks:", breaks);

  const availability = [];

  for (const service of services) {
    const durationMinutes = service.duration ?? 30; // fallback 30 mins
    const duration = durationMinutes * 60000;

    console.log(`Service: ${service.name}, Duration: ${durationMinutes} mins`);

    // Generate all possible slots
    const slots = generateSlots(start_time, end_time, duration, date);
    console.log("Generated slots:", slots.map(s => s.start));

    // Get bookings for this service on this date
    const [bookings] = await db.execute(
      `SELECT start_time,end_time FROM bookings WHERE booking_date=? AND service_id=?`,
      [date, service.id]
    );

    const blocked = [...bookings, ...breaks];

    // Filter out slots that overlap with breaks or bookings
    const freeSlots = slots
      .filter(slot =>
        !blocked.some(b =>
          isOverlap(slot.start, slot.end, b.start_time, b.end_time)
        )
      )
      .map(slot => slot.start);

    console.log("Free slots for service", service.name, ":", freeSlots);

    availability.push({
      id: service.id,
      name: service.name,
      available_slots: freeSlots
    });
  }

  return availability;
};

exports.updateAvailability = async ({ id, start_time, end_time, enabled }) => {
  if (!enabled) {
    await db.execute(
      "DELETE FROM admin_availability WHERE day_of_week = ?",
      [id]
    );
    return true;
  }

  await db.execute(
    `REPLACE INTO admin_availability (day_of_week, start_time, end_time)
     VALUES (?, ?, ?)`,
    [id, start_time, end_time]
  );

  return true;
};