"use client";

import { useState } from "react";

const days = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" }
];

export type ScheduleDay = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    enabled: boolean;
 };

export default function AvailabilityPage() {

    const [schedule, setSchedule] = useState<ScheduleDay[]>(
        days.map((d) => ({
          ...d,
          start_time: "09:00",
          end_time: "17:00",
          enabled: false
        }))
      );

    const updateField = (
        index: number,
        field: keyof ScheduleDay,
        value: string | boolean
    ) => {
        const updated = [...schedule];
        updated[index][field] = value as never;
        setSchedule(updated);
};

  const saveAvailability = async () => {

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(schedule)
    });

    alert("Availability saved");
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Admin Availability</h2>

      {schedule.map((day, index) => (
        <div key={day.id} style={{ marginBottom: 10 }}>

          <label style={{ width: 120, display: "inline-block" }}>
            {day.name}
          </label>

          <input
            type="checkbox"
            checked={day.enabled}
            onChange={(e) =>
              updateField(index, "enabled", e.target.checked)
            }
          />

          {day.enabled && (
            <>
              <input
                type="time"
                value={day.start_time}
                onChange={(e) =>
                  updateField(index, "start_time", e.target.value)
                }
              />

              <span> - </span>

              <input
                type="time"
                value={day.end_time}
                onChange={(e) =>
                  updateField(index, "end_time", e.target.value)
                }
              />
            </>
          )}

        </div>
      ))}
        <br/>
      <button 
        onClick={saveAvailability}
        className="bg-[#D4AF37] text-black px-5 py-2 rounded hover:opacity-90 transition"
      >
        Save Availability
      </button>
    </div>
  );
}