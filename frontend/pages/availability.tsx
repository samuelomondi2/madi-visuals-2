type ServiceAvailability = {
  id: number;
  name: string;
  available_slots: string[];
};

type AvailabilityResponse = {
  date: string;
  services: ServiceAvailability[];
};

import { useEffect, useState } from "react";

export default function AdminAvailabilityByDate() {
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10); 
        const res = await fetch(`${baseUrl}/api/availability?date=${today}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json: AvailabilityResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch availability", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  if (loading) return <p>Loading availability...</p>;
  if (!data) return <p>No availability data</p>;

  return (
    <main className="p-6 bg-black min-h-screen text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Availability for {data.date}</h1>

      {data.services.map((service) => (
        <section key={service.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
          <div className="grid grid-cols-4 gap-3">
            {service.available_slots.map((slot) => (
              <div
                key={slot}
                className="bg-gray-800 rounded px-3 py-1 text-center"
              >
                {slot}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}