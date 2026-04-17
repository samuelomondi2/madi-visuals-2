import { useEffect, useState } from "react";

type DayAvailability = {
  id: number;
  start_time: string;
  end_time: string;
  // enabled: boolean;
};

type SpecialDay = {
  id: number;
  date: string;
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

  useEffect(() => {
    fetchSchedule();
    fetchSpecialDays();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/availability`);
      const data = await res.json();
      console.log("Schedule", data)
      const formatted: DayAvailability[] = data.times.map((t: any) => ({
        id: t.day_of_week,
        start_time: t.start_time.slice(0, 5),
        end_time: t.end_time.slice(0, 5),
        // enabled: t.enabled,
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

  // const handleToggleDay = (id: number) => {
  //   setSchedule((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  // };

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

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-4">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-10 max-w-5xl mx-auto">
      {/* Weekly Availability */}
      <section className="bg-gray-50 shadow-md rounded p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Weekly Availability</h2>
        <table className="min-w-full border border-gray-300 rounded overflow-hidden bg-white">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2 border-b">Day</th>
              <th className="px-4 py-2 border-b">Enabled</th>
              <th className="px-4 py-2 border-b">Start</th>
              <th className="px-4 py-2 border-b">End</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((day) => (
              <tr key={day.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{daysOfWeek[day.id]}</td>
                {/* <td className="px-4 py-2 border-b text-center">
                  <input type="checkbox" checked={day.enabled} onChange={() => handleToggleDay(day.id)} />
                </td> */}
                <td className="px-4 py-2 border-b">
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => handleTimeChange(day.id, "start_time", e.target.value)}
                    // disabled={!day.enabled}
                    className="border rounded px-2 py-1 w-full text-gray-800"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => handleTimeChange(day.id, "end_time", e.target.value)}
                    // disabled={!day.enabled}
                    className="border rounded px-2 py-1 w-full text-gray-800"
                  />
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => updateDay(day)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Special Days */}
      <section className="bg-gray-50 shadow-md rounded p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Set Special Days</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-gray-800">
            Date:
            <input
              type="date"
              value={newSpecialDay.date ?? ""}
              onChange={(e) => handleNewSpecialChange("date", e.target.value)}
              className="border rounded px-2 py-1 mt-1 text-gray-800"
            />
          </label>
          {/* <label className="flex flex-col text-gray-800">
            Day of Week:
            <select
              value={newSpecialDay.day_of_week ?? ""}
              onChange={(e) =>
                handleNewSpecialChange("day_of_week", e.target.value === "" ? null : Number(e.target.value))
              }
              className="border rounded px-2 py-1 mt-1 text-gray-800"
            >
              <option value="">--Select--</option>
              {daysOfWeek.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </label> */}
          {/* <label className="flex items-center gap-2 text-gray-800">
            <input
              type="checkbox"
              checked={newSpecialDay.is_recurring}
              onChange={(e) => handleNewSpecialChange("is_recurring", e.target.checked)}
            />
            Recurring
          </label> */}
          <label className="flex items-center gap-2 text-gray-800">
            <input
              type="checkbox"
              checked={newSpecialDay.is_closed}
              onChange={(e) => handleNewSpecialChange("is_closed", e.target.checked)}
            />
            Closed
          </label>
          <label className="flex flex-col md:col-span-2 text-gray-800">
            Reason:
            <input
              type="text"
              value={newSpecialDay.reason ?? ""}
              onChange={(e) => handleNewSpecialChange("reason", e.target.value)}
              className="border rounded px-2 py-1 mt-1 text-gray-800 w-full"
            />
          </label>
          <button
            onClick={createSpecialDay}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 md:col-span-2"
          >
            Save Special Day
          </button>
        </div>
      </section>

      {/* Existing Special Days */}
      <section className="bg-gray-50 shadow-md rounded p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Existing Special Days</h2>
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-2 text-gray-800">
            Show special days for date:
            <input
              type="date"
              value={filterDate ?? ""}
              onChange={(e) => {
                setFilterDate(e.target.value);
                fetchSpecialDays(e.target.value);
              }}
              className="border rounded px-2 py-1 text-gray-800"
            />
          </label>
          <button
            onClick={() => fetchSpecialDays(filterDate)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        <table className="min-w-full border border-gray-300 rounded overflow-hidden bg-white">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Day of Week</th>
              <th className="px-4 py-2 border-b">Recurring</th>
              <th className="px-4 py-2 border-b">Closed</th>
              <th className="px-4 py-2 border-b">Reason</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(specialDays) && specialDays.length > 0 ? (
              specialDays.map((sd) => (
                <tr key={sd.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b">{sd.date ? new Date(sd.date).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 border-b">{sd.day_of_week !== null ? daysOfWeek[sd.day_of_week] : "-"}</td>
                  <td className="px-4 py-2 border-b">{sd.is_recurring ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 border-b">{sd.is_closed ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 border-b">{sd.reason ?? "-"}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => deleteSpecialDay(sd.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No special days found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}