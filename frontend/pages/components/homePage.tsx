"use client";

import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import HeroVideo from "./hero-video";
import Footer from "./footer";
import Services from "../services";
import FloatingServices from "./floatingServices";

interface HeroData {
  image: string | null;
  video: string | null;
}

export default function HomePage() {
  const [heroes, setHeroes] = useState<HeroData>({ image: null, video: null });

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const [resImage, resVideo] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=image`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero?type=video`),
        ]);

        const [dataImage, dataVideo] = await Promise.all([
          resImage.json(),
          resVideo.json(),
        ]);

        setHeroes({
          image: dataImage?.hero?.media_url  || null,
          video: dataVideo?.hero?.media_url  || null,
        });
      } catch (err) {
        console.error("Failed to fetch heroes:", err);
      }
    };

    fetchHeroes();
  }, []);

  return (
    <>
      <Navbar />
      <FloatingServices />

      <main className="w-full mt-12">
        <Hero imageUrl={heroes.image ?? "/hero.webp"} />

        {heroes.video && (
          <HeroVideo videoUrl={heroes.video} posterUrl="/hero.webp" />
        )}

        <Services />
        <Footer />
      </main>
    </>
  );
}