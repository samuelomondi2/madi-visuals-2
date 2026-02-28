"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        Upload Media
      </h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-[#D4AF37] px-6 py-2 text-black rounded"
      >
        Upload
      </button>

      {message && (
        <p className="mt-4 text-green-400">{message}</p>
      )}
    </div>
  );
}