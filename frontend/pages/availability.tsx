'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DaySchedule = {
  id: number;
  enabled: boolean;
  start_time: string;
  end_time: string;
};

type Break = {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type SpecialDay = {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  is_closed: boolean;
};

const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function AdminSchedule() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return router.push("/login");

      try {
        // Weekly schedule (availability)
        const resSchedule = await fetch(`${baseUrl}/api/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataSchedule = await resSchedule.json();
        if (Array.isArray(dataSchedule)) {
          setSchedule(dataSchedule);
        } else {
          // default 7 days
          setSchedule([...Array(7).keys()].map(i => ({
            id: i,
            enabled: true,
            start_time: "09:00",
            end_time: "17:00"
          })));
        }

        // Breaks
        const resBreaks = await fetch(`${baseUrl}/api/admin_breaks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataBreaks = await resBreaks.json();
        setBreaks(dataBreaks.breaks || []);

        // Special Days
        const resSpecial = await fetch(`${baseUrl}/api/special_days`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataSpecial = await resSpecial.json();
        setSpecialDays(dataSpecial.special_days || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6 text-center text-white">Loading...</p>;

  // Handlers
  const handleDayChange = (id: number, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleBreakChange = (index: number, field: keyof Break, value: any) => {
    setBreaks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleSpecialDayChange = (index: number, field: keyof SpecialDay, value: any) => {
    setSpecialDays(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addBreak = () => setBreaks(prev => [...prev, { day_of_week: 0, start_time: "09:00", end_time: "10:00" }]);
  const addSpecialDay = () => setSpecialDays(prev => [...prev, { date: "", start_time: "09:00", end_time: "17:00", is_closed: false }]);

  const saveAll = async () => {
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      // Weekly availability
      await fetch(`${baseUrl}/api/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(schedule),
      });

      // Breaks
      await fetch(`${baseUrl}/api/admin_breaks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(breaks),
      });

      // Special Days
      await fetch(`${baseUrl}/api/special_days`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(specialDays),
      });

      alert("Schedule, breaks, and special days saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save data");
    }
  };

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Weekly Availability */}
        <section>
          <h2 className="text-xl font-bold mb-2">Weekly Availability</h2>
          {schedule.map(day => (
            <div key={day.id} className="flex items-center gap-2 mb-2">
              <label>
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={e => handleDayChange(day.id, "enabled", e.target.checked)}
                />
                {" "}{dayNames[day.id]}
              </label>
              <input
                type="time"
                value={day.start_time}
                onChange={e => handleDayChange(day.id, "start_time", e.target.value)}
                className="bg-gray-800 p-1 rounded"
              />
              <span>to</span>
              <input
                type="time"
                value={day.end_time}
                onChange={e => handleDayChange(day.id, "end_time", e.target.value)}
                className="bg-gray-800 p-1 rounded"
              />
            </div>
          ))}
        </section>

        {/* Breaks */}
        <section>
          <h2 className="text-xl font-bold mb-2">Blocked Times (Breaks)</h2>
          {breaks.map((b, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={b.day_of_week}
                onChange={e => handleBreakChange(i, "day_of_week", Number(e.target.value))}
                className="bg-gray-800 p-1 rounded"
              >
                {dayNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              <input
                type="time"
                value={b.start_time}
                onChange={e => handleBreakChange(i, "start_time", e.target.value)}
                className="bg-gray-800 p-1 rounded"
              />
              <span>to</span>
              <input
                type="time"
                value={b.end_time}
                onChange={e => handleBreakChange(i, "end_time", e.target.value)}
                className="bg-gray-800 p-1 rounded"
              />
            </div>
          ))}
          <button onClick={addBreak} className="bg-yellow-600 px-3 py-1 rounded mt-2">Add Break</button>
        </section>

        {/* Special Days */}
        <section>
          <h2 className="text-xl font-bold mb-2">Special Days</h2>
          {specialDays.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={s.date}
                onChange={e => handleSpecialDayChange(i, "date", e.target.value)}
                className="bg-gray-800 p-1 rounded"
              />
              <label className="ml-2">
                <input
                  type="radio"
                  checked={s.is_closed}
                  onChange={e => handleSpecialDayChange(i, "is_closed", e.target.checked)}
                /> Closed
              </label>
            </div>
          ))}
          <button onClick={addSpecialDay} className="bg-yellow-600 px-3 py-1 rounded mt-2">Add Special Day</button>
        </section>

        <button
          onClick={saveAll}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded mt-4"
        >
          Save Schedule
        </button>
      </div>
    </main>
  );
}