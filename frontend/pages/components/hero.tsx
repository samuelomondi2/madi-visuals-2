"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroContent = {
  id: number;
  title: string;
  name: string;
  description: string;
  hero_image_url?: string | null;
};

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    async function fetchHeroContent() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/hero`
        );
        const data = await res.json();
        setContent(data.hero_section);
      } catch (err) {
        console.error("Hero fetch failed:", err);
      }
    }

    fetchHeroContent();
  }, []);

  if (!content) return null;

  const spaceIndex = content.name.indexOf(" ");
  const firstName =
    spaceIndex === -1 ? content.name : content.name.slice(0, spaceIndex);
  const lastName =
    spaceIndex === -1 ? "" : content.name.slice(spaceIndex + 1);

  // Normalize the image URL for Next.js
  const heroImageUrl = content.hero_image_url || "/hero.webp";

  console.log("Hero Image URL:", heroImageUrl);

  return (
    <section className="bg-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2">
        {/* Left Content */}
        <div>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            {content.title}{" "}
            <span className="text-[#D4AF37]">{firstName}</span>
            {lastName && (
              <>
                <br />
                {lastName}.
              </>
            )}
          </h1>

          <p className="mt-6 max-w-lg text-white leading-relaxed text-neutral-400">
            {content.description}
          </p>
        </div>

        {/* Right Image */}
        <div className="relative h-[420px] md:h-[600px] md:-mr-24">
          {heroImageUrl.startsWith("http") ? (
            <Image
              src={heroImageUrl}
              alt={`${content.name} hero image`}
              fill
              priority
              className="rounded-xl object-cover"
              // unoptimized // bypass Next.js image optimization
            />
          ) : (
            <Image
              src={heroImageUrl} // fallback local image
              alt="Default hero image"
              fill
              priority
              className="rounded-xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}