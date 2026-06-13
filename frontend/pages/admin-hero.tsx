'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Hero {
  _id: string;
  title: string;
  name: string;
  description: string;
  updatedAt: string;
}

interface HeroForm {
  title: string;
  name: string;
  description: string;
}

const defaultForm: HeroForm = {
  title: "",
  name: "",
  description: "",
};

export default function AdminHero() {
  const [hero, setHero]       = useState<Hero | null>(null);
  const [form, setForm]       = useState<HeroForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchHero = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        // No hero yet — form stays empty
        setHero(null);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch hero");

      const data = await res.json();
      setHero(data);
      setForm({
        title:       data.title       || "",
        name:        data.name        || "",
        description: data.description || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load hero");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHero(); }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!form.title || !form.name || !form.description) {
      setError("All fields are required.");
      return;
    }

    const token = getToken();
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save hero");

      const { hero: updated } = await res.json();
      setHero(updated);
      setSuccess("Hero updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to save hero");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded bg-neutral-800 border border-neutral-700 text-white text-sm p-2 focus:border-[#D4AF37] outline-none";

  if (loading) return <p className="text-white">Loading hero...</p>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Hero</h1>
        {hero && (
          <p className="text-neutral-400 text-sm">
            Last updated: {new Date(hero.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Preview */}
      {hero && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Current Hero</p>
          <p className="text-[#D4AF37] text-sm font-medium mb-1">{hero.title}</p>
          <p className="text-white text-2xl font-bold mb-2">{hero.name}</p>
          <p className="text-gray-400 text-sm leading-relaxed">{hero.description}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
          {hero ? "Update Hero" : "Create Hero"}
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Title</label>
            <input
              type="text"
              placeholder="e.g. Welcome to"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="e.g. Madi Visuals"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Description</label>
            <textarea
              placeholder="e.g. Capturing moments that last a lifetime."
              className={inputClass}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {error   && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-3">{success}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D4AF37] text-black px-6 py-2 rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : hero ? "Update" : "Create"}
          </button>
          {hero && (
            <button
              onClick={() => setForm({ title: hero.title, name: hero.name, description: hero.description })}
              className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </>
  );
}