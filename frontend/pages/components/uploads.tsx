"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Uploads() {
    const [mediaLoading, setMediaLoading] = useState(true);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [mediaError, setMediaError] = useState("");
    const [hero, setHero] = useState<{ type: "image" | "video"; url: string } | null>(null);

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

    useEffect(() => {
        const fetchHero = async () => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero`);
          const data = await res.json();
      
          if (data) {
            setHero({
              type: data.media_type,
              url: data.media_url,
            });
          }
        };
      
        fetchHero();
      }, []);

    const handleDelete = async ({}) => {}

    const handleSetHero = async (file: any) => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/set-hero`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: file.id }),
          });
      
          setHero({
            type: file.media_type,
            url: file.media_url,
          });
      
        } catch (err) {
          console.error("Failed to set hero", err);
        }
      };

    

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
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <button 
                                className="bg-red-600 px-2 py-1 text-xs rounded" 
                                onClick={() => handleDelete(file.id)}
                            >Delete</button>
                            <button 
                                className="bg-[#D4AF37] px-2 py-1 text-xs rounded"
                                onClick={() => handleSetHero(file)}
                                disabled={file.media_type !== "image"}
                            >Set Hero Image</button>
                            <button 
                                className="bg-[#37d43f] px-2 py-1 text-xs rounded"
                                onClick={() => handleSetHero(file)}
                                disabled={file.media_type !== "video"}
                            >Set Hero Video</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}