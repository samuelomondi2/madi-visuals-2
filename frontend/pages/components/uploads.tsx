"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface MediaFile {
  _id: string;
  media_url: string;
  media_type: "image" | "video";
  is_hero: boolean;
  size: number;
  createdAt: string;
}

interface HeroState {
  image: string | null;
  video: string | null;
}

const ITEMS_PER_PAGE = 8;

export default function Uploads() {
  const [mediaFiles, setMediaFiles]   = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError]   = useState<string | null>(null);
  const [hero, setHero]               = useState<HeroState>({ image: null, video: null });
  const [uploading, setUploading]     = useState(false);
  const [page, setPage]               = useState(1);

  const startIndex   = (page - 1) * ITEMS_PER_PAGE;
  const currentFiles = mediaFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages   = Math.ceil(mediaFiles.length / ITEMS_PER_PAGE);

  const fetchMedia = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setMediaFiles(data.data || []);
    } catch (err) {
      console.error(err);
      setMediaError("Failed to load media files");
    } finally {
      setMediaLoading(false);
    }
  };

  const fetchHero = async (type: "image" | "video") => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=${type}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.hero?.media_url) {
        setHero((prev) => ({ ...prev, [type]: data.hero.media_url }));
      }
    } catch (err) {
      console.error("Failed to fetch hero:", err);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchHero("image");
    fetchHero("video");
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }
      await fetchMedia(); // ✅ refresh list after upload
      e.target.value = ""; // ✅ reset input
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetHero = async (file: MediaFile) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/set-hero`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file._id, type: file.media_type }), // ✅ _id not id
      });
      if (!res.ok) throw new Error("Failed to set hero");
      await fetchHero(file.media_type);
      await fetchMedia(); // ✅ refresh to update is_hero badges
    } catch (err) {
      console.error("Failed to set hero:", err);
      alert("Failed to set hero");
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete/${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      setMediaFiles((prev) => prev.filter((f) => f._id !== _id));
      if (page > 1 && currentFiles.length === 1) setPage((p) => p - 1); // ✅ go back if last item on page deleted
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete file");
    }
  };

  return (
    <div>
      {/* Hero previews */}
      {(hero.image || hero.video) && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {hero.image && (
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-neutral-400 mb-1">Current Hero Image</p>
              <img src={hero.image} alt="Hero" className="w-full h-32 object-cover rounded" />
            </div>
          )}
          {hero.video && (
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-neutral-400 mb-1">Current Hero Video</p>
              <video src={hero.video} className="w-full h-32 object-cover rounded" muted />
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      <label className="mb-6 flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-[#D4AF37] px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition">
        <span>{uploading ? "Uploading..." : "Upload Media"}</span>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Media grid */}
      {mediaLoading ? (
        <p className="text-white">Loading media...</p>
      ) : mediaError ? (
        <p className="text-red-500">{mediaError}</p>
      ) : mediaFiles.length === 0 ? (
        <p className="text-neutral-400">No media uploaded yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentFiles.map((file) => (
              <div
                key={file._id}
                className={`bg-[#1a1a1a] p-2 rounded relative border-2 ${
                  file.is_hero ? "border-[#D4AF37]" : "border-neutral-800"
                }`}
              >
                {/* Hero badge */}
                {file.is_hero && (
                  <span className="absolute top-2 left-2 bg-[#D4AF37] text-black text-xs px-1.5 py-0.5 rounded z-10">
                    Hero
                  </span>
                )}

                {file.media_type === "image" ? (
                  <Image
                    src={file.media_url}
                    alt="media"
                    width={400}
                    height={160}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <video src={file.media_url} controls className="w-full h-40 rounded" />
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                  {file.media_type === "image" && (
                    <button
                      onClick={() => handleSetHero(file)}
                      className="bg-[#D4AF37] text-black px-2 py-1 text-xs rounded hover:opacity-90"
                    >
                      Set Hero
                    </button>
                  )}
                  {file.media_type === "video" && (
                    <button
                      onClick={() => handleSetHero(file)}
                      className="bg-green-600 px-2 py-1 text-xs rounded hover:bg-green-500"
                    >
                      Set Hero
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-white text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}