"use client";

import { useEffect, useState } from "react";

type HeroContent = {
  id: number;
  title: string;
  name: string;
  description: string;
  media_url?: string;
  media_type?: "image" | "video";
};

type HeroPreview = {
  type: "image" | "video";
  url: string;
} | null;

type AdminHeroProps = {
  hero?: HeroPreview; 
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHero() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<HeroPreview>(null);

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

  // ✅ Upload file (image/video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await fetch(`${API_URL}/api/media`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setPreview({
        type: data.type,
        url: data.url,
      });

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle text changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!heroContent) return;

    setHeroContent({
      ...heroContent,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Save hero content + media
  const handleSave = async () => {
    if (!heroContent) return;

    try {
      setSaving(true);

      const mediaUrl =
        preview?.url || heroContent.media_url || null;
      const mediaType =
        preview?.type || heroContent.media_type || null;

      await fetch(`${API_URL}/api/hero/${heroContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: heroContent.title,
          name: heroContent.name,
          description: heroContent.description,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });

      alert("Updated successfully!");

      setHeroContent((prev) =>
        prev
          ? {
              ...prev,
              media_url: mediaUrl || undefined,
              media_type: mediaType || undefined,
            }
          : prev
      );

      setPreview(null);

    } catch (err) {
      console.error(err);
      alert("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Decide what to display (preview > saved)
  const displayHero: HeroPreview =
    preview ||
    (heroContent?.media_url && heroContent.media_type
      ? {
          url: heroContent.media_url,
          type: heroContent.media_type,
        }
      : null);

  if (loading) return <p className="p-10">Loading...</p>;
  if (!heroContent) return <p className="p-10">No hero content found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-10 flex flex-col md:flex-row gap-8">

      {displayHero && (
        <div className="flex-1 bg-black rounded overflow-hidden shadow-md">
          {displayHero.type === "image" ? (
            <img
              src={displayHero.url}
              alt="Hero Preview"
              className="w-full h-80 object-cover"
            />
          ) : (
            <video
              src={displayHero.url}
              controls
              className="w-full h-80 object-cover"
            />
          )}
        </div>
      )}

      {/* 🔥 RIGHT: FORM */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-semibold">Edit Hero Section</h1>

        {/* Title */}
        <input
          name="title"
          value={heroContent.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Hero Title"
        />

        {/* Name */}
        <input
          name="name"
          value={heroContent.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Hero Name"
        />

        {/* Description */}
        <textarea
          name="description"
          value={heroContent.description}
          onChange={handleChange}
          rows={5}
          className="w-full border p-3 rounded"
          placeholder="Hero Description"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#D4AF37] text-black px-5 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}