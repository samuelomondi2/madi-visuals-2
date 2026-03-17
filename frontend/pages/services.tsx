'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: number;
  name: string;
  duration: number | null;
  base_price: number | string;
  delivery: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
};

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
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const fetchServices = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      const mapped = data.services.map((service: any) => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        base_price: service.base_price,
        delivery: service.delivery,
        category: service.category,
        createdAt: service.created_at,
        updatedAt: service.updated_at, 
      }));
      setService(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const lifestyleServices = service.filter(
    (s) => s.category === "Lifestyle Photography"
  );
  
  const sportsVideo = service.filter(
    (s) => s.category === "Sports Videography"
  );
  
  const sportsPhoto = service.filter(
    (s) => s.category === "Sports Photography"
  );
  
  const comboServices = service.filter(
    (s) => s.category === "Photo & Video Combo"
  );

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <main className="pt-24 text-center text-white">
        Loading services...
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 text-center text-red-500">
        {error}
      </main>
    );
  }

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div id="services" className="text-center mb-12">
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
            {lifestyleServices.map((service) => (
              <ServiceCard
              key={service.id}
              title={service.name}
              duration={service.duration ? `${service.duration} mins` : ""}
              price={`$${Number(service.base_price)}`}
              delivery={service.delivery}
            />
            ))}
          </div>
        </Section>

        {/* Sports Videography */}
        <Section title="Sports Videography">
          <div className="grid gap-6 md:grid-cols-2">
            {sportsVideo.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                duration={service.duration ? `${service.duration} mins` : ""}
                price={`$${Number(service.base_price)}`}
                delivery={service.delivery}
              />
            ))}
          </div>
        </Section>

        {/* Sports Photography */}
        <Section title="Sports Photography">
          <div className="grid gap-6 md:grid-cols-3">
            {sportsPhoto.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                duration={service.duration ? `${service.duration} mins` : ""}
                price={`$${Number(service.base_price)}`}
                delivery={service.delivery}
              />
            ))}
          </div>
        </Section>

        {/* Combo */}
        <Section title="Photo & Video Combo">
          <div className="max-w-md mx-auto">
          {comboServices.map((service: any) => (
            <ServiceCard
              key={service.id}
              title={service.name}
              price={`$${service.base_price}`}
              delivery={service.delivery}
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