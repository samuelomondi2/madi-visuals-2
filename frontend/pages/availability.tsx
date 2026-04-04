import { useEffect, useState } from "react";

interface DaySchedule {
  id: number;
  name: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

const DAYS_OF_WEEK: DaySchedule[] = [
  { id: 0, name: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 1, name: "Monday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 2, name: "Tuesday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 3, name: "Wednesday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 4, name: "Thursday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 5, name: "Friday", enabled: false, start_time: "09:00", end_time: "17:00" },
  { id: 6, name: "Saturday", enabled: false, start_time: "09:00", end_time: "17:00" },
];

export default function AvailabilityPage () {
  // const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS_OF_WEEK);
  // const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState("");

  // useEffect(() => {
  //   const fetchAvailability = async () => {
  //     try {
  //       const res = await await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/availability`);
  //       if (res.data && Array.isArray(res.data)) {
  //         setSchedule(prev =>
  //           prev.map(day => {
  //             const serverDay = res.data.find((d: any) => d.day_of_week === day.id);
  //             return serverDay
  //               ? { ...day, enabled: true, start_time: serverDay.start_time.slice(0, 5), end_time: serverDay.end_time.slice(0, 5) }
  //               : day;
  //           })
  //         );
  //       }
  //       console.log(res)
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchAvailability();
  // }, []);

  // const handleToggle = (id: number) => {
  //   setSchedule(prev => prev.map(d => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  // };

  // const handleTimeChange = (id: number, field: "start_time" | "end_time", value: string) => {
  //   setSchedule(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  // };

  // const handleSave = async () => {
  //   setLoading(true);
  //   setMessage("");
  //   try {
  //     await axios.post("/api/admin/availability", { schedule });
  //     setMessage("Availability updated successfully!");
  //   } catch (err: any) {
  //     console.error(err);
  //     setMessage(err?.response?.data?.message || "Failed to update availability");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
  //   <div className="admin-availability">
  //     <h2>Admin Availability</h2>
  //     {schedule.map(day => (
  //       <div key={day.id} className="day-row">
  //         <label>
  //           <input type="checkbox" checked={day.enabled} onChange={() => handleToggle(day.id)} />
  //           {day.name}
  //         </label>
  //         <input
  //           type="time"
  //           value={day.start_time}
  //           disabled={!day.enabled}
  //           onChange={(e) => handleTimeChange(day.id, "start_time", e.target.value)}
  //         />
  //         <span>to</span>
  //         <input
  //           type="time"
  //           value={day.end_time}
  //           disabled={!day.enabled}
  //           onChange={(e) => handleTimeChange(day.id, "end_time", e.target.value)}
  //         />
  //       </div>
  //     ))}
  //     <button onClick={handleSave} disabled={loading}>
  //       {loading ? "Saving..." : "Save Availability"}
  //     </button>
  //     {message && <p>{message}</p>}
  //   </div>
  // );
};