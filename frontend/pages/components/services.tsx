'use client';

import Link from "next/link";

const lifestyleServices = [
  {
    title: "Lifestyle Shoot",
    duration: "30 minutes",
    price: "$125",
    delivery: "3–5 business days",
  },
  {
    title: "Couple / Duo Shoot",
    duration: "30 minutes",
    price: "$150",
    delivery: "3–5 business days",
  },
  {
    title: "Group Shoot (3–5 people)",
    duration: "30 minutes",
    price: "$175",
    delivery: "3–5 business days",
  },
];

const sportsVideo = [
  {
    title: "Single Player Highlight Reel",
    price: "$100",
    delivery: "3–5 business days",
  },
  {
    title: "Media Team Collaboration Add-On",
    price: "+$25",
    delivery: "Optional add-on",
  },
];

const sportsPhoto = [
  {
    title: "Team Portrait Session",
    duration: "1 hour",
    price: "$150",
    delivery: "3–5 business days",
  },
  {
    title: "Individual Player Session",
    price: "$75",
    delivery: "3–5 business days",
  },
  {
    title: "Media Team Collaboration Add-On",
    price: "+$25",
    delivery: "Optional add-on",
  },
];

const addons = [
  { title: "Extra Hours", description: "Price upon request" },
  { title: "Rush Delivery", description: "Price upon request" },
  { title: "Reels / Social Edits", description: "Price upon request" },
  { title: "Other Services", description: "Custom add-ons available" },
];

function ServiceCard({ title, duration, price, delivery, description }: any) {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 text-center transition hover:scale-105 hover:bg-neutral-800">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      {duration && <p className="text-gray-400 mb-1">{duration}</p>}

      {price && (
        <p className="text-[#D4AF37] font-bold text-lg mb-1">{price}</p>
      )}

      {delivery && (
        <p className="text-gray-400 text-sm">Delivery: {delivery}</p>
      )}

      {description && (
        <p className="text-gray-400 text-sm">{description}</p>
      )}
    </div>
  );
}

export default function Services() {
  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Services & Pricing
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            High-quality photography and videography for lifestyle,
            sports, and special events.
          </p>
        </div>

        {/* Lifestyle Photography */}
        <Section title="Lifestyle Photography">
          <p className="text-gray-300 mb-6 text-center">
            Most booked for personal branding, couples & everyday moments.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {lifestyleServices.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </div>
        </Section>

        {/* Sports Videography */}
        <Section title="Sports Videography">
          <div className="grid gap-6 md:grid-cols-2">
            {sportsVideo.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </div>
        </Section>

        {/* Sports Photography */}
        <Section title="Sports Photography">
          <div className="grid gap-6 md:grid-cols-3">
            {sportsPhoto.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </div>
        </Section>

        {/* Combo */}
        <Section title="Photo & Video Combo">
          <div className="max-w-md mx-auto">
            <ServiceCard
              title="Sports Event Coverage"
              price="$150 per event/game"
              description="Includes curated photos and short-form video clips"
              delivery="3–5 business days"
            />
          </div>
        </Section>

        {/* Special Events */}
        <Section title="Weddings, Baby Showers & Special Events">
          <div className="text-center">
            <p className="text-gray-300 mb-6">
              Custom pricing available. Please contact Madi Visuals
              directly for event inquiries.
            </p>

            <Link
              href="/contact"
              className="inline-block rounded-lg bg-[#D4AF37] px-6 py-3 text-black font-medium hover:opacity-90 transition"
            >
              Contact Us
            </Link>
          </div>
        </Section>

        {/* Add-ons */}
        <Section title="Add-Ons">
          <div className="grid gap-6 md:grid-cols-2">
            {addons.map((addon, i) => (
              <ServiceCard key={i} {...addon} />
            ))}
          </div>
        </Section>

      </section>
    </main>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-semibold mb-6 text-center text-[#D4AF37]">
        {title}
      </h2>
      {children}
    </div>
  );
}