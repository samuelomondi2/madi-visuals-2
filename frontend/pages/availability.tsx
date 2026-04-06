import { useEffect, useState } from "react";

type DayAvailability = {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
};

type SpecialDay = {
  id: number;
  date: string | null;
  day_of_week: number | null;
  is_recurring: boolean;
  is_closed: boolean;
  reason?: string;
};

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminAvailability() {
  const [schedule, setSchedule] = useState<DayAvailability[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

  const [newSpecialDay, setNewSpecialDay] = useState<Omit<SpecialDay, "id">>({
    date: "",
    day_of_week: null,
    is_recurring: false,
    is_closed: true,
    reason: "",
  });

  

  // Fetch weekly schedule and special days
  useEffect(() => {
    fetchSchedule();
    fetchSpecialDays();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/availability`);
      const data = await res.json();
      const formatted: DayAvailability[] = data.times.map((t: any) => ({
        id: t.day_of_week,
        start_time: t.start_time.slice(0, 5),
        end_time: t.end_time.slice(0, 5),
        enabled: true,
      }));
      setSchedule(formatted);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch availability");
      setLoading(false);
    }
  };

  const fetchSpecialDays = async (date?: string) => {
    try {
      const url = date
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/special-days?date=${date}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/special-days`;
      const res = await fetch(url);
      const data = await res.json();
      setSpecialDays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSpecialDays([]);
    }
  };

  const handleToggleDay = (id: number) => {
    setSchedule((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  const handleTimeChange = (id: number, field: "start_time" | "end_time", value: string) => {
    setSchedule((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const updateDay = async (day: DayAvailability) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/${day.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(day),
      });
      if (!res.ok) throw new Error("Failed to update day");
      alert(`${daysOfWeek[day.id]} updated successfully`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleNewSpecialChange = (field: keyof Omit<SpecialDay, "id">, value: any) => {
    setNewSpecialDay((prev) => ({ ...prev, [field]: value }));
  };

  const createSpecialDay = async () => {
    try {
      if (!newSpecialDay.date && newSpecialDay.day_of_week === null) {
        alert("Please provide a date or day of week");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/special-days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpecialDay),
      });

      if (!res.ok) throw new Error("Failed to create special day");

      alert("Special day created successfully!");
      setNewSpecialDay({ date: "", day_of_week: null, is_recurring: false, is_closed: true, reason: "" });
      fetchSpecialDays();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const deleteSpecialDay = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/special-days/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete special day");

      alert("Special day deleted successfully!");
      fetchSpecialDays();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-6">
      <h2>Weekly Availability</h2>
      <table className="border-collapse border">
        <thead>
          <tr>
            <th>Day</th>
            <th>Enabled</th>
            <th>Start</th>
            <th>End</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((day) => (
            <tr key={day.id}>
              <td>{daysOfWeek[day.id]}</td>
              <td>
                <input type="checkbox" checked={day.enabled} onChange={() => handleToggleDay(day.id)} />
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
                <button onClick={() => updateDay(day)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Set Special Days</h2>
      <div className="flex flex-col max-w-md gap-2">
        <label>
          Date:
          <input
            type="date"
            value={newSpecialDay.date ?? ""}
            onChange={(e) => handleNewSpecialChange("date", e.target.value)}
          />
        </label>

        <label>
          Day of Week:
          <select
            value={newSpecialDay.day_of_week ?? ""}
            onChange={(e) =>
              handleNewSpecialChange("day_of_week", e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">--Select--</option>
            {daysOfWeek.map((day, idx) => (
              <option key={idx} value={idx}>
                {day}
              </option>
            ))}
          </select>
        </label>

        <label>
          Recurring:
          <input
            type="checkbox"
            checked={newSpecialDay.is_recurring}
            onChange={(e) => handleNewSpecialChange("is_recurring", e.target.checked)}
          />
        </label>

        <label>
          Closed:
          <input
            type="checkbox"
            checked={newSpecialDay.is_closed}
            onChange={(e) => handleNewSpecialChange("is_closed", e.target.checked)}
          />
        </label>

        <label>
          Reason:
          <input
            type="text"
            value={newSpecialDay.reason}
            onChange={(e) => handleNewSpecialChange("reason", e.target.value)}
          />
        </label>

        <button onClick={createSpecialDay}>Save Special Day</button>
      </div>

      <h2>Existing Special Days</h2>
      <div className="mb-4">
        <label>
          Show special days for date:{" "}
          <input
            type="date"
            value={filterDate ?? ""}
            onChange={(e) => {
              setFilterDate(e.target.value);
              fetchSpecialDays(e.target.value);
            }}
          />
        </label>
        <button
          onClick={() => fetchSpecialDays(filterDate)}
          className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      <table className="border-collapse border mt-2">
        <thead>
          <tr>
            <th>Date</th>
            <th>Day of Week</th>
            <th>Recurring</th>
            <th>Closed</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(specialDays) && specialDays.length > 0 ? (
            specialDays.map((sd) => (
              <tr key={sd.id}>
                <td>{sd.date ? new Date(sd.date).toLocaleDateString() : "-"}</td>
                <td>{sd.day_of_week !== null ? daysOfWeek[sd.day_of_week] : "-"}</td>
                <td>{sd.is_recurring ? "Yes" : "No"}</td>
                <td>{sd.is_closed ? "Yes" : "No"}</td>
                <td>{sd.reason ?? "-"}</td>
                <td>
                  <button
                    onClick={() => deleteSpecialDay(sd.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No special days found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}