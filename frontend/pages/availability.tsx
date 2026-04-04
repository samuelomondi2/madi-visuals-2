import { useEffect, useState } from "react";

type DayAvailability = {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
};

type Break = {
  id: number;
  start_time: string;
  end_time: string;
};

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminAvailability() {
  const [schedule, setSchedule] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted: DayAvailability[] = data.services?.map((s: any) => ({
          id: s.id,
          start_time: s.start_time || "09:00",
          end_time: s.end_time || "17:00",
          enabled: true,
        })) || [];
        setSchedule(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch availability");
        setLoading(false);
      });
      console.log("Schedule", schedule)
  }, []);

  const handleToggleDay = (id: number) => {
    setSchedule((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleTimeChange = (id: number, field: "start_time" | "end_time", value: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const saveSchedule = async () => {
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save schedule");
      }

      alert("Schedule saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const updateDay = async (day: DayAvailability) => {
    try {
      const res = await fetch(`/api/availability/${day.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: day.start_time,
          end_time: day.end_time,
          enabled: day.enabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update day");
      }

      alert(`${daysOfWeek[day.id]} updated successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Admin Availability</h1>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Enabled</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((day) => (
            <tr key={day.id}>
              <td>{daysOfWeek[day.id]}</td>
              <td>
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => handleToggleDay(day.id)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={day.start_time}
                  onChange={(e) => handleTimeChange(day.id, "start_time", e.target.value)}
                  disabled={!day.enabled}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={day.end_time}
                  onChange={(e) => handleTimeChange(day.id, "end_time", e.target.value)}
                  disabled={!day.enabled}
                />
              </td>
              <td>
                <button onClick={() => updateDay(day)} disabled={!day.enabled}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveSchedule}>Save Weekly Schedule</button>
    </div>
  );
}