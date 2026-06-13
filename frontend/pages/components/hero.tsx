"use client";

import { useEffect, useState } from "react";

interface HeroContent {
  _id: string;
  title: string;
  name: string;
  description: string;
}

interface HeroProps {
  imageUrl: string;
}

export default function Hero({ imageUrl }: HeroProps) {
  const [content, setContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero`);
        if (!res.ok) throw new Error("Failed to fetch hero");
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Hero fetch failed:", err);
      }
    };
    fetchHero();
  }, []);

  const title       = content?.title       ?? "";
  const name        = content?.name        ?? "Madi Visuals";
  const description = content?.description ?? "";

  const spaceIndex = name.indexOf(" ");
  const firstName  = spaceIndex === -1 ? name : name.slice(0, spaceIndex);
  const lastName   = spaceIndex === -1 ? ""   : name.slice(spaceIndex + 1);

  return (
    <section className="bg-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2">
        {/* Left Content */}
        <div>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            {title && <span>{title} </span>}
            <span className="text-[#D4AF37]">{firstName}</span>
            {lastName && (
              <>
                <br />
                {lastName}.
              </>
            )}
          </h1>

          <p className="mt-6 max-w-lg leading-relaxed text-neutral-400 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Right Hero Image */}
        <div className="relative h-[420px] md:h-[600px] md:-mr-24">
          <img
            src={imageUrl}
            alt="Hero"
            className="w-full h-full object-cover rounded"
          />
        </div>
      </div>
    </section>
  );
}