"use client";

import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import HeroVideo from "./hero-video";
import Footer from "./footer";
import Services from "../services";
import FloatingServices from "./floatingServices";
import PopupForm from "./test";
import BookingModal from "./bookOnline";

type HeroVideoResponse = {
  id: number;
  url: string;
  updated_at: string;
};

export default function HomePage() {
  const [heroVideo, setHeroVideo] = useState<HeroVideoResponse | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function loadHeroVideo() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero-video`, { cache: "no-store" });

        if (!res.ok) return;

        const data = await res.json();
        if (data?.hero_video_url) {
          setHeroVideo((prev) => (prev?.url === data.hero_video_url.url ? prev : data.hero_video_url));
        }
      } catch (err) {
        console.error("Failed to fetch hero video", err);
      }
    }

    loadHeroVideo();
    interval = setInterval(loadHeroVideo, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      <FloatingServices/>

      <main className="w-full mt-12">
        <Hero />

        {heroVideo ? (
          <HeroVideo key={heroVideo.url} videoUrl={heroVideo.url} posterUrl="/hero.webp" />
        ) : (
          <img src="/hero.webp" alt="Hero Placeholder" className="w-full h-auto mt-8" />
        )}

        <Services/>
        
        <Footer />
      </main>
    </>
  );
}