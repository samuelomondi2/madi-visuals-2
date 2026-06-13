'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AvailabilityEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_mins: number;
  buffer_mins: number;
}

interface AvailabilityForm {
  start_time: string;
  end_time: string;
  slot_duration_mins: string;
  buffer_mins: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALL_DAYS  = [0, 1, 2, 3, 4, 5, 6];

export default function AdminAvailability() {
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [editId, setEditId]             = useState<string | null>(null);
  const [editForm, setEditForm]         = useState<AvailabilityForm>({
    start_time: "", end_time: "", slot_duration_mins: "", buffer_mins: "0",
  });
  const [saving, setSaving]             = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState({
    day_of_week: "", start_time: "", end_time: "", slot_duration_mins: "60", buffer_mins: "0",
  });
  const [adding, setAdding]   = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const configuredDays = availability.map((a) => a.day_of_week);
  const availableDays  = ALL_DAYS.filter((d) => !configuredDays.includes(d));

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch availability");
      const data = await res.json();

      setAvailability(data.map((a: any) => ({
        id:                 a._id,
        day_of_week:        a.day_of_week,
        start_time:         a.start_time,
        end_time:           a.end_time,
        is_available:       a.is_available,
        slot_duration_mins: a.slot_duration_mins,
        buffer_mins:        a.buffer_mins ?? 0,
      })));
    } catch (err) {
      console.error(err);
      setError("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvailability(); }, []);

  const handleEdit = (entry: AvailabilityEntry) => {
    setEditId(entry.id);
    setEditForm({
      start_time:         entry.start_time,
      end_time:           entry.end_time,
      slot_duration_mins: entry.slot_duration_mins.toString(),
      buffer_mins:        entry.buffer_mins.toString(),
    });
  };

  const handleSave = async (id: string) => {
    const token = getToken();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          start_time:         editForm.start_time,
          end_time:           editForm.end_time,
          slot_duration_mins: Number(editForm.slot_duration_mins),
          buffer_mins:        Number(editForm.buffer_mins),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");

      // ✅ buffer_mins now included in state update
      setAvailability((prev) =>
        prev.map((a) =>
          a.id === id ? {
            ...a,
            start_time:         editForm.start_time,
            end_time:           editForm.end_time,
            slot_duration_mins: Number(editForm.slot_duration_mins),
            buffer_mins:        Number(editForm.buffer_mins),
          } : a
        )
      );
      setEditId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setAvailability((prev) =>
        prev.map((a) => a.id === id ? { ...a, is_available: !current } : a)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle availability");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this day's availability?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const handleAdd = async () => {
    setAddError(null);
    if (!addForm.day_of_week || !addForm.start_time || !addForm.end_time) {
      setAddError("Day, start time and end time are required.");
      return;
    }
    const token = getToken();
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          day_of_week:        Number(addForm.day_of_week),
          start_time:         addForm.start_time,
          end_time:           addForm.end_time,
          slot_duration_mins: Number(addForm.slot_duration_mins) || 60,
          buffer_mins:        Number(addForm.buffer_mins) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to add availability");

      const { availability: newEntry } = await res.json();

      // ✅ buffer_mins included in new entry
      setAvailability((prev) =>
        [...prev, {
          id:                 newEntry._id,
          day_of_week:        newEntry.day_of_week,
          start_time:         newEntry.start_time,
          end_time:           newEntry.end_time,
          is_available:       newEntry.is_available,
          slot_duration_mins: newEntry.slot_duration_mins,
          buffer_mins:        newEntry.buffer_mins ?? 0,
        }].sort((a, b) => a.day_of_week - b.day_of_week)
      );

      // ✅ reset includes buffer_mins
      setAddForm({ day_of_week: "", start_time: "", end_time: "", slot_duration_mins: "60", buffer_mins: "0" });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      setAddError("Failed to add availability");
    } finally {
      setAdding(false);
    }
  };

  const inputClass = "w-full rounded bg-neutral-800 border border-neutral-700 text-white text-sm p-2 focus:border-[#D4AF37] outline-none";

  if (loading) return <p className="text-white">Loading availability...</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Availability</h1>
        <button
          onClick={() => { setShowAddModal(true); setAddError(null); }}
          disabled={availableDays.length === 0}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded font-semibold w-full sm:w-auto hover:opacity-90 transition disabled:opacity-40"
        >
          + Add Day
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-white text-lg font-bold">×</button>
            <h2 className="text-xl font-bold text-[#D4AF37] mb-4">Add Availability</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Day *</label>
                <select className={inputClass} value={addForm.day_of_week} onChange={(e) => setAddForm({ ...addForm, day_of_week: e.target.value })}>
                  <option value="">Select Day</option>
                  {availableDays.map((d) => (
                    <option key={d} value={d}>{DAY_NAMES[d]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-neutral-400 mb-1 block">Start Time *</label>
                  <input type="time" className={inputClass} value={addForm.start_time} onChange={(e) => setAddForm({ ...addForm, start_time: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-400 mb-1 block">End Time *</label>
                  <input type="time" className={inputClass} value={addForm.end_time} onChange={(e) => setAddForm({ ...addForm, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Default Slot Duration (mins)</label>
                <input type="number" className={inputClass} value={addForm.slot_duration_mins} onChange={(e) => setAddForm({ ...addForm, slot_duration_mins: e.target.value })} />
                <p className="text-xs text-neutral-500 mt-1">Used when a service has no duration set</p>
              </div>

              {/* ✅ Buffer input in add modal */}
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Buffer Time (mins)</label>
                <input type="number" className={inputClass} value={addForm.buffer_mins} onChange={(e) => setAddForm({ ...addForm, buffer_mins: e.target.value })} />
                <p className="text-xs text-neutral-500 mt-1">Gap between bookings e.g. 15 = travel/prep time</p>
              </div>
            </div>

            {addError && <p className="text-red-500 text-sm mt-3">{addError}</p>}

            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} disabled={adding} className="bg-[#D4AF37] text-black px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50">
                {adding ? "Adding..." : "Add Day"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability List */}
      {availability.length === 0 ? (
        <p className="text-neutral-400">No availability set up yet.</p>
      ) : (
        <div className="space-y-4">
          {[...availability]
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((entry) => (
              <div
                key={entry.id}
                className={`bg-neutral-900 p-4 rounded-lg border ${
                  entry.is_available ? "border-neutral-800" : "border-red-900 opacity-60"
                }`}
              >
                {editId === entry.id ? (
                  /* Edit Mode */
                  <div className="flex flex-col gap-3">
                    <p className="font-semibold text-[#D4AF37]">{DAY_NAMES[entry.day_of_week]}</p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-neutral-400 mb-1 block">Start Time</label>
                        <input type="time" className={inputClass} value={editForm.start_time} onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-neutral-400 mb-1 block">End Time</label>
                        <input type="time" className={inputClass} value={editForm.end_time} onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Default Slot Duration (mins)</label>
                      <input type="number" className={inputClass} value={editForm.slot_duration_mins} onChange={(e) => setEditForm({ ...editForm, slot_duration_mins: e.target.value })} />
                    </div>

                    {/* ✅ Buffer input in edit mode */}
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Buffer Time (mins)</label>
                      <input type="number" className={inputClass} value={editForm.buffer_mins} onChange={(e) => setEditForm({ ...editForm, buffer_mins: e.target.value })} />
                      <p className="text-xs text-neutral-500 mt-1">Gap between bookings e.g. 15 = travel/prep time</p>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleSave(entry.id)} disabled={saving} className="bg-[#D4AF37] text-black px-4 py-1.5 rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)} className="bg-neutral-700 text-white px-4 py-1.5 rounded text-sm hover:bg-neutral-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <p className="font-semibold text-lg text-white">{DAY_NAMES[entry.day_of_week]}</p>
                      <p className="text-gray-400 text-sm">{entry.start_time} – {entry.end_time}</p>
                      <p className="text-gray-400 text-sm">
                        Slot: {entry.slot_duration_mins} mins
                        {entry.buffer_mins > 0 && ` · ${entry.buffer_mins} min buffer`} {/* ✅ */}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                        entry.is_available ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                      }`}>
                        {entry.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(entry)} className="bg-[#D4AF37] text-black px-3 py-1.5 rounded text-sm font-semibold hover:opacity-90">Edit</button>
                      <button onClick={() => handleToggle(entry.id, entry.is_available)} className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-600">
                        {entry.is_available ? "Mark Unavailable" : "Mark Available"}
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="bg-red-700 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}