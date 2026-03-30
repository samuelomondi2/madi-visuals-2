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
    const savedHero = localStorage.getItem("hero");
    if (savedHero) setHero(JSON.parse(savedHero));
  }, []);

  return (
    <>
      <Navbar />
      <FloatingServices />

      <main className="w-full mt-12">
        <Hero />

        {hero?.type === "video" && (
          <HeroVideo videoUrl={hero.url} />
        )}

        <Services />
        <Footer />
      </main>
    </>
  );
}