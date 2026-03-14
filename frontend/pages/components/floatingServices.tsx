'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import BookingModal from "./bookOnline";

export default function FloatingBooking() {
  const [panelOpen, setPanelOpen] = useState(false);  // controls panel visibility
  const [modalOpen, setModalOpen] = useState(false);  // controls booking modal visibility

  useEffect(() => {
    const handleScroll = () => {
      if (panelOpen) setPanelOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [panelOpen]);

  return (
    <>
      {/* Mobile Floating Booking Panel */}
      <div className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2">

        {/* Slide Panel */}
        <div
          className={`absolute right-14 top-1/2 -translate-y-1/2 bg-black border border-neutral-800 rounded-xl shadow-xl p-4 w-44 transition-all duration-300 ${
            panelOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <h3 className="text-xs font-semibold text-white mb-3">Quick Access</h3>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setModalOpen(true);
                setPanelOpen(false);
              }}
              className="rounded-lg border border-[#D4AF37] text-[#D4AF37] text-xs py-1.5 text-center hover:bg-[#D4AF37] hover:text-black transition"
            >
              Book Session
            </button>

            <Link href="/#services" className="rounded-lg border border-neutral-700 text-white text-xs py-1.5 text-center hover:border-[#D4AF37] hover:text-[#D4AF37]">
              Services & Pricing
            </Link>
            <Link href="https://madivisuals27.pixieset.com/sampleshots/" className="rounded-lg border border-neutral-700 text-white text-xs py-1.5 text-center hover:border-[#D4AF37] hover:text-[#D4AF37]">
              View Portfolio
            </Link>
            <Link href="/faq" className="rounded-lg border border-neutral-700 text-white text-xs py-1.5 text-center hover:border-[#D4AF37] hover:text-[#D4AF37]">
              FAQ & Policies
            </Link>
            <Link href="/contact" className="rounded-lg border border-neutral-700 text-white text-xs py-1.5 text-center hover:border-[#D4AF37] hover:text-[#D4AF37]">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Vertical Tab - toggles panel */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="relative bg-[#D4AF37] text-black font-semibold px-0 py-8 rounded-l-[30px] shadow-lg flex items-center justify-center hover:scale-105 transition"
        >
          <span className="absolute inset-0 rounded-l-[30px] animate-ping bg-[#D4AF37] opacity-30"></span>
          <span className="rotate-90 whitespace-nowrap relative text-sm">Reserve</span>
        </button>
      </div>

      {/* Booking Modal - shared for desktop and mobile */}
      <BookingModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
}