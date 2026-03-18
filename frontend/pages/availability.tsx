'use client';

import { useEffect, useState } from "react";

type DaySchedule = {
  id: number;
  enabled: boolean;
  start_time: string;
  end_time: string;
};

type AdminBreak = {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type SpecialDay = {
  id?: number;
  date: string;
  start_time?: string;
  end_time?: string;
  is_closed: boolean;
};

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [breaks, setBreaks] = useState<AdminBreak[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;


  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  useEffect(() => {
    // fetch initial schedule, breaks, special_days here
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Prefill schedule (weekly)
        const resAvail = await fetch(`${baseUrl}/api/availability?date=${new Date().toISOString().slice(0,10)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataAvail = await resAvail.json();
        // convert to DaySchedule
        const days: DaySchedule[] = [
          { id: 0, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 1, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 2, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 3, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 4, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 5, enabled: true, start_time: "09:00", end_time: "17:00" },
          { id: 6, enabled: true, start_time: "09:00", end_time: "17:00" },
        ];
        setSchedule(days);

        // TODO: fetch breaks & special_days if you have API endpoints
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDayChange = (id: number, key: keyof DaySchedule, value: any) => {
    setSchedule(prev =>
      prev.map(day => (day.id === id ? { ...day, [key]: value } : day))
    );
  };

  const addBreak = () => {
    setBreaks(prev => [...prev, { day_of_week: 0, start_time: "09:00", end_time: "10:00" }]);
  };

  const addSpecialDay = () => {
    setSpecialDays(prev => [...prev, { date: new Date().toISOString().slice(0,10), is_closed: true }]);
  };

  const saveSchedule = async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Save weekly availability
      await fetch(`${baseUrl}/api/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(schedule),
      });

      // TODO: Save breaks
      // await fetch(`${baseUrl}/api/admin_breaks`, { ... });

      // TODO: Save special_days
      // await fetch(`${baseUrl}/api/special_days`, { ... });

      alert("Schedule saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save schedule");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Schedule</h1>

      {/* Weekly Availability */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Weekly Availability</h2>
        {schedule.map(day => (
          <div key={day.id} className="flex items-center gap-2 mb-2">
            <label>
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={e => handleDayChange(day.id, "enabled", e.target.checked)}
              />
              {" "}{dayNames[day.id]} {/* Or dayNamesMonFirst[day.id] */}
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
      </div>


      {/* Blocked Times (Breaks) */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Blocked Times (Breaks)</h2>
        {breaks.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            
            {/* Day dropdown */}
            <select
              value={b.day_of_week}
              onChange={e => {
                const val = Number(e.target.value);
                setBreaks(prev => prev.map((x, j) => (j === i ? { ...x, day_of_week: val } : x)));
              }}
              className="bg-gray-800 p-1 rounded"
            >
              {dayNames.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            {/* Start time */}
            <input
              type="time"
              value={b.start_time}
              onChange={e => {
                const val = e.target.value;
                setBreaks(prev => prev.map((x, j) => (j === i ? { ...x, start_time: val } : x)));
              }}
              className="bg-gray-800 p-1 rounded"
            />
            <span>to</span>
            {/* End time */}
            <input
              type="time"
              value={b.end_time}
              onChange={e => {
                const val = e.target.value;
                setBreaks(prev => prev.map((x, j) => (j === i ? { ...x, end_time: val } : x)));
              }}
              className="bg-gray-800 p-1 rounded"
            />
          </div>
        ))}
        <button
          onClick={() => setBreaks(prev => [...prev, { day_of_week: 0, start_time: "09:00", end_time: "10:00" }])}
          className="bg-yellow-600 px-3 py-1 rounded mt-2"
        >
          Add Break
        </button>
      </div>
      {/* Special Days */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Special Days</h2>
        {specialDays.map((d,i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input type="date" value={d.date}
              onChange={e => {
                const val = e.target.value;
                setSpecialDays(prev => prev.map((x,j) => j===i ? {...x, date: val} : x));
              }} className="bg-gray-800 p-1 rounded"/>
            <label>
              <input type="checkbox" checked={d.is_closed} 
                onChange={e => {
                  const val = e.target.checked;
                  setSpecialDays(prev => prev.map((x,j) => j===i ? {...x, is_closed: val} : x));
                }}/> Closed
            </label>
          </div>
        ))}
        <button onClick={addSpecialDay} className="bg-red-600 px-3 py-1 rounded mt-2">Add Special Day</button>
      </div>

      <button onClick={saveSchedule} className="bg-green-600 px-4 py-2 rounded mt-4">Save Schedule</button>
    </div>
  );
}