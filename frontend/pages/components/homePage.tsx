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
  const [hero, setHero] = useState<HeroType | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/hero`);
        const data = await res.json();
        
        console.log(data);
        if (data?.hero) {
          setHero({
            type: data.hero.media_type,
            url: data.hero.media_url,
          });
        }
      } catch (err) {
        console.error("Failed to fetch hero", err);
      }
    };
  
    fetchHero();
  }, []);

  return (
    <>
      <Navbar />
      <FloatingServices />

      <main className="w-full mt-12">
        {hero?.type === "image" && <Hero imageUrl={hero.url}/>}
        
        {hero?.type === "video" && <HeroVideo videoUrl={hero.url} posterUrl="/hero.webp" />}

        <Services />
        <Footer />
      </main>
    </>
  );
}