'use client';

import Image from "next/image";
import Link from "next/link";

export default function Services() {
  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Services & Pricing
        </h1>
        <p className="text-center text-gray-300 mb-12">
          High-quality photography and videography for lifestyle, sports, and special events.
        </p>

        {/* Lifestyle Photography */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">
            Lifestyle Photography
          </h2>
          <p className="text-gray-300 mb-6">Most booked for personal branding, couples & everyday moments.</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Lifestyle Shoot</h3>
              <p className="mb-2 text-gray-400">30 minutes</p>
              <p className="text-[#D4AF37] font-bold mb-2">$125</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Couple / Duo Shoot</h3>
              <p className="mb-2 text-gray-400">30 minutes</p>
              <p className="text-[#D4AF37] font-bold mb-2">$150</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Group Shoot (3–5 people)</h3>
              <p className="mb-2 text-gray-400">30 minutes</p>
              <p className="text-[#D4AF37] font-bold mb-2">$175</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
          </div>
        </div>

        {/* Sports Video */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">Sports Videography</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Single Player Highlight Reel</h3>
              <p className="text-[#D4AF37] font-bold mb-2">$100</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Media Team Collaboration Add-On</h3>
              <p className="text-[#D4AF37] font-bold mb-2">+$25</p>
              <p className="text-gray-400 text-sm">Optional add-on</p>
            </div>
          </div>
        </div>

        {/* Sports Photography */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">Sports Photography</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Team Portrait Session</h3>
              <p className="mb-2 text-gray-400">1 hour</p>
              <p className="text-[#D4AF37] font-bold mb-2">$150</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Individual Player Session</h3>
              <p className="mb-2 text-gray-400">—</p>
              <p className="text-[#D4AF37] font-bold mb-2">$75</p>
              <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Media Team Collaboration Add-On</h3>
              <p className="text-[#D4AF37] font-bold mb-2">+$25</p>
              <p className="text-gray-400 text-sm">Optional add-on</p>
            </div>
          </div>
        </div>

        {/* Combo Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">Photo & Video Combo</h2>
          <div className="bg-neutral-900 rounded-xl p-6 text-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Sports Event Coverage</h3>
            <p className="text-[#D4AF37] font-bold mb-2">$150 per event/game</p>
            <p className="mb-2 text-gray-400">Includes curated photos and short-form video clips</p>
            <p className="text-gray-400 text-sm">Delivery: 3–5 business days</p>
          </div>
        </div>

        {/* Special Events */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">Weddings, Baby Showers & Special Events</h2>
          <p className="text-gray-300 mb-4">Custom pricing available. Please contact Madi Visuals directly for event inquiries.</p>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-[#D4AF37] px-6 py-3 text-black font-medium hover:opacity-90 transition"
          >
            Contact Us
          </Link>
        </div>

        {/* Add-Ons */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#D4AF37]">Add-Ons</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Extra Hours</h3>
              <p className="text-gray-400">Price upon request</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Rush Delivery</h3>
              <p className="text-gray-400">Price upon request</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Reels / Social Edits</h3>
              <p className="text-gray-400">Price upon request</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Other Services</h3>
              <p className="text-gray-400">Custom add-ons available</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}