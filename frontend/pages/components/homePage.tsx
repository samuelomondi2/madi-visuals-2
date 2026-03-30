"use client";

import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import HeroVideo from "./hero-video";
import Footer from "./footer";
import Services from "../services";
import FloatingServices from "./floatingServices";

type HeroType = { type: "image" | "video"; url: string };

export default function HomePage() {
  const [heroImage, setHeroImage] = useState<HeroType | null>(null);
  const [heroVideo, setHeroVideo] = useState<HeroType | null>(null);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const resImage = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=image`);
        const dataImage = await resImage.json();
        if (dataImage.hero) setHeroImage({ type: "image", url: dataImage.hero.media_url });

        const resVideo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=video`);
        const dataVideo = await resVideo.json();
        if (dataVideo.hero) setHeroVideo({ type: "video", url: dataVideo.hero.media_url });
      } catch (err) {
        console.error(err);
      }
    };

    fetchHeroes();
  }, []);

  return (
    <>
      <Navbar />
      <FloatingServices />

      <main className="w-full mt-12">
        {heroImage && <Hero imageUrl={heroImage.url} />}
        
        {heroVideo && <HeroVideo videoUrl={heroVideo.url} posterUrl="/hero.webp" />}

        <Services />
        <Footer />
      </main>
    </>
  );
}