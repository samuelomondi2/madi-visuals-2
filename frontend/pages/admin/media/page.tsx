"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MediaPage() {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFiles() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files`
      );
      const data = await res.json();
      setFiles(data);
    }

    fetchFiles();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        Media Library
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {files.map((file) => (
          <div key={file.id} className="bg-black p-4 rounded">
            {file.file_type === "image" ? (
              <Image
                src={file.url}
                alt=""
                width={300}
                height={200}
                className="rounded"
              />
            ) : (
              <video
                src={file.url}
                controls
                className="rounded w-full"
              />
            )}

            <p className="mt-2 text-sm text-neutral-400">
              {file.original_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}