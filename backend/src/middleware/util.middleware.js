function generateSlots(startTime, endTime, duration, date) {

    const slots = [];
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
  
    let current = start;
  
    while (current.getTime() + duration <= end.getTime()) {
  
      slots.push({
        start: current.toTimeString().slice(0,5),
        end: new Date(current.getTime() + duration)
          .toTimeString()
          .slice(0,5)
      });
  
      current = new Date(current.getTime() + duration);
    }
  
    return slots;
  }

  function isOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
  }

  module.exports = {generateSlots, isOverlap}