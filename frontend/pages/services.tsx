'use client';

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

interface Service {
  id: string;
  name: string;
  duration?: number;
  base_price: number;
  delivery: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceCardProps {
  title: string;
  duration?: string;
  price?: string;
  delivery?: string;
  description?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Data
const addons = [
  { title: "Extra Hours",       description: "Price upon request" },
  { title: "Rush Delivery",     description: "Price upon request" },
  { title: "Reels / Social Edits", description: "Price upon request" },
  { title: "Other Services",    description: "Custom add-ons available" },
];

// Components
function ServiceCard({ title, duration, price, delivery, description }: ServiceCardProps) {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 text-center transition hover:scale-105 hover:bg-neutral-800">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {duration    && <p className="text-gray-400 mb-1">{duration}</p>}
      {price       && <p className="text-[#D4AF37] font-bold text-lg mb-1">{price}</p>}
      {delivery    && <p className="text-gray-400 text-sm">Delivery: {delivery}</p>}
      {description && <p className="text-gray-400 text-sm">{description}</p>}
    </div>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-semibold mb-6 text-center text-[#D4AF37]">
        {title}
      </h2>
      {children}
    </div>
  );
}

// Page
export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
      if (!res.ok) throw new Error("Failed to fetch services");

      const data: any[] = await res.json();

      const mapped: Service[] = data.map((s) => ({
        id:         s._id,
        name:       s.name,
        duration:   s.duration,
        base_price: s.base_price,
        delivery:   s.delivery,
        category:   s.category,
        createdAt:  s.createdAt,
        updatedAt:  s.updatedAt,
      }));

      setServices(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const lifestyleServices = useMemo(() => services.filter(s => s.category === "Lifestyle Photography"),  [services]);
  const sportsVideo       = useMemo(() => services.filter(s => s.category === "Sports Videography"),     [services]);
  const sportsPhoto       = useMemo(() => services.filter(s => s.category === "Sports Photography"),     [services]);
  const comboServices     = useMemo(() => services.filter(s => s.category === "Photo & Video Combo"),    [services]);

  if (loading) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white text-center">
        Loading services...
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 min-h-screen bg-black text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-4 px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:opacity-90 transition"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div id="services" className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Services & Pricing</h1>
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
            {lifestyleServices.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.name}
                duration={s.duration ? `${s.duration} mins` : undefined}
                price={`$${s.base_price}`}
                delivery={s.delivery}
              />
            ))}
          </div>
        </Section>

        {/* Sports Videography */}
        <Section title="Sports Videography">
          <div className="grid gap-6 md:grid-cols-2">
            {sportsVideo.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.name}
                duration={s.duration ? `${s.duration} mins` : undefined}
                price={`$${s.base_price}`}
                delivery={s.delivery}
              />
            ))}
          </div>
        </Section>

        {/* Sports Photography */}
        <Section title="Sports Photography">
          <div className="grid gap-6 md:grid-cols-3">
            {sportsPhoto.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.name}
                duration={s.duration ? `${s.duration} mins` : undefined}
                price={`$${s.base_price}`}
                delivery={s.delivery}
              />
            ))}
          </div>
        </Section>

        {/* Photo & Video Combo */}
        <Section title="Photo & Video Combo">
          <div className="grid gap-6 md:grid-cols-2">
            {comboServices.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.name}
                price={`$${s.base_price}`}
                delivery={s.delivery}
              />
            ))}
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

        {/* Add-Ons */}
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