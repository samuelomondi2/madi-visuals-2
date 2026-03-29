"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Uploads() {
    const [mediaLoading, setMediaLoading] = useState(true);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [mediaError, setMediaError] = useState("");

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
    }, [])

  return (
    <div>
        {mediaLoading ? (
            <p>Loading media...</p>
        ) : mediaError ? (
            <p className="text-red-500">{mediaError}</p>
        ) : mediaFiles.length === 0 ? (
            <p>No media uploaded yet.</p>
        ): (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaFiles.map(file => (
                    <div key={file.id} className='bg-[#1a1a1a] p-2 rounded relative border-2'>
                        {file.media_type === "image" ? (
                            <Image
                                src={file.media_url}
                                alt="media"
                                width={400}
                                height={160}
                                className="object-cover rounded"
                            />
                        ) : (
                            <video
                                src={file.media_url}
                                controls
                                className="w-full h-40 rounded"
                            />
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}