"use client";

import { useEffect, useState } from "react";

type HeroContent = {
  id: number;
  title: string;
  name: string;
  description: string;
};

type HeroPreview = {
  type: "image" | "video";
  url: string;
} | null;

type AdminHeroProps = {
  hero?: HeroPreview; // optional live preview from Dashboard
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHero({ hero: liveHero }: AdminHeroProps) {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch(`${API_URL}/api/hero`);
        const data = await res.json();
        setHeroContent(data.hero_section);
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
    if (!heroContent) return;

    setHeroContent({
      ...heroContent,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!heroContent) return;

    try {
      setSaving(true);

      await fetch(`${API_URL}/api/hero/${heroContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: heroContent.title,
          name: heroContent.name,
          description: heroContent.description,
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
  if (!heroContent) return <p className="p-10">No hero content found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-10 flex flex-col md:flex-row gap-8">
      {/* Left: Preview */}
      {liveHero && (
        <div className="flex-1 bg-black rounded overflow-hidden shadow-md">
          {liveHero.type === "image" ? (
            <img src={liveHero.url} alt="Hero Preview" className="w-full h-80 object-cover" />
          ) : (
            <video src={liveHero.url} controls className="w-full h-80 object-cover" />
          )}
        </div>
      )}

      {/* Right: Editable fields */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Hero Section</h1>

        <input
          name="title"
          value={heroContent.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Hero Title"
        />

        <input
          name="name"
          value={heroContent.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Hero Name"
        />

        <textarea
          name="description"
          value={heroContent.description}
          onChange={handleChange}
          rows={5}
          className="w-full border p-3 rounded"
          placeholder="Hero Description"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#D4AF37] text-black px-5 py-2 rounded hover:opacity-90 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}