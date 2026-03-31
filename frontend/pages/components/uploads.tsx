"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroType = { type: "image" | "video"; url: string };

export default function Uploads() {
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaError, setMediaError] = useState("");
  const [hero, setHero] = useState<HeroType | null>(null);

  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
      if (!res.ok) throw new Error("Failed to fetch media files");
      const data = await res.json();
      setMediaFiles(data.data);
    } catch (err) {
      console.error(err);
      setMediaError("Failed to load media files");
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchHero = async (type: "image" | "video") => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch hero");
      const data = await res.json();
      if (data?.hero) {
        setHero({ type, url: data.hero.media_url });
      }
    } catch (err) {
      console.error("Failed to fetch hero:", err);
    }
  };

  useEffect(() => {
    fetchHero("image");
    fetchHero("video");
  }, []);

  const handleSetHero = async (file: any) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/set-hero`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, type: file.media_type }), 
      });

      fetchHero(file.media_type);
    } catch (err) {
      console.error("Failed to set hero", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Delete media with id", id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete media");
      }

      setMediaFiles((prev) => prev.filter((file) => file.id !== id));

    } catch (error) {
      console.error("Failed to set hero", error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]); 
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }

      await fetchMedia();
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  return (
    <div>
      <label className="mb-4 flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-[#D4AF37] px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition">
        <span>Upload Media</span>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>
      {mediaLoading ? (
        <p>Loading media...</p>
      ) : mediaError ? (
        <p className="text-red-500">{mediaError}</p>
      ) : mediaFiles.length === 0 ? (
        <p>No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <div key={file.id} className="bg-[#1a1a1a] p-2 rounded relative border-2">
              {file.media_type === "image" ? (
                <Image
                  src={file.media_url}
                  alt="media"
                  width={400}
                  height={160}
                  className="object-cover rounded"
                />
              ) : (
                <video src={file.media_url} controls className="w-full h-40 rounded" />
              )}

              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <button
                  className="bg-red-600 px-2 py-1 text-xs rounded"
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </button>

                <button
                  className="bg-[#D4AF37] px-2 py-1 text-xs rounded"
                  onClick={() => handleSetHero(file)}
                  disabled={file.media_type !== "image"}
                >
                  Set Hero Image
                </button>

                <button
                  className="bg-[#37d43f] px-2 py-1 text-xs rounded"
                  onClick={() => handleSetHero(file)}
                  disabled={file.media_type !== "video"}
                >
                  Set Hero Video
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}