"use client";

import { useEffect, useState } from "react";

type HeroContent = {
  id: number;
  title: string;
  name: string;
  description: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHero() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch(`${API_URL}/api/hero`);
        const data = await res.json();
        setHero(data.hero_section);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHero();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!hero) return;

    setHero({
      ...hero,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!hero) return;

    try {
      setSaving(true);

      await fetch(`${API_URL}/api/hero/${hero.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: hero.title,
          name: hero.name,
          description: hero.description,
        }),
      });

      alert("Updated successfully!");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (!hero) return <p className="p-10">No hero content found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-2xl font-semibold mb-8">Edit Hero Section</h1>

      <div className="space-y-6">
        <input
          name="title"
          value={hero.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="name"
          value={hero.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          value={hero.description}
          onChange={handleChange}
          rows={5}
          className="w-full border p-3 rounded"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}