"use client";

import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import HeroVideo from "./hero-video";
import Footer from "./footer";
import Services from "../services";
import FloatingServices from "./floatingServices";
import BookingModal from "./bookOnline";

type HeroVideoResponse = {
  id: number;
  url: string;
  updated_at: string;
};

export default function HomePage() {

  return (
    <>
      <Navbar />

      <FloatingServices/>

      <main className="w-full mt-12">
        <Hero />

        <img src="/hero.webp" alt="Hero Placeholder" className="w-full h-auto mt-8" />

        <Services/>
        
        <Footer />
      </main>
    </>
  );
}