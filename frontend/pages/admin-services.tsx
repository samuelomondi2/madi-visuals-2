'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: number;
  name: string;
  duration: number | null;
  base_price: number;
  delivery: string;
  category: string;
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const fetchServices = async () => {
    const token = getToken();
    if (!token) return router.push("/login");
    
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <p className="p-6">Loading services...</p>;

  return (
    <main className="p-10 bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Services</h1>

          <button className="bg-[#D4AF37] text-black px-4 py-2 rounded">
            Add Service
          </button>
        </div>

        <table className="w-full border border-neutral-800">
          <thead className="bg-neutral-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-neutral-800">
                <td className="p-3">{service.name}</td>
                <td className="p-3">{service.category}</td>
                <td className="p-3">${service.base_price}</td>
                <td className="p-3">
                  {service.duration ? `${service.duration} mins` : "-"}
                </td>

                <td className="p-3 space-x-2">
                  <button className="bg-blue-600 px-3 py-1 rounded">
                    Edit
                  </button>

                  <button className="bg-red-600 px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}