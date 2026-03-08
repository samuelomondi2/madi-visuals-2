const db = require("../config/db");
const servicesService = require("./services.service");

export const getAvailability = async (date) => {

  const services = servicesService.getAllServices;

  const availability = [];

  for (let service of services) {
    const [bookings] = await db.execute(
      "SELECT start_time, end_time FROM bookings WHERE booking_date = ? AND service_id = ?",
      [date, service.id]
    );

    // Working hours: 09:00 to 17:00
    const slots = [];
    let current = new Date(`${date}T09:00:00`);
    const end = new Date(`${date}T17:00:00`);
    const durationMs = service.duration_minutes * 60 * 1000;

    while (current.getTime() + durationMs <= end.getTime()) {
      const slotStart = current.toTimeString().slice(0, 5);
      const slotEndDate = new Date(current.getTime() + durationMs);
      const slotEnd = slotEndDate.toTimeString().slice(0, 5);

      const conflict = bookings.some(
        (b) => slotStart < b.end_time && slotEnd > b.start_time
      );

      if (!conflict) slots.push(slotStart);
      current = new Date(current.getTime() + durationMs);
    }

    availability.push({
      id: service.id,
      name: service.name,
      available_slots: slots,
    });
  }

  return availability;
};