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

type NewService = {
    name: string;
    category: string;
    base_price: number;
    duration: number | null;
    delivery: string;
  };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<NewService>({
    name: "",
    category: "",
    base_price: 0,
    duration: null,
    delivery: "",
  });

  const router = useRouter();

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  const fetchServices = async () => {
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const token = getToken();
    if (!token) return router.push("/login");
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newService),
      });
  
      if (!res.ok) throw new Error("Failed to add service");
  
      const data = await res.json();
  
      console.log("API RESPONSE:", data);
  
      const createdService: Service = {
        ...data.service,
        base_price: Number(data.service.base_price),
      };

      setServices((prev) => [createdService, ...prev]);
  
      setShowAddModal(false);
  
      setNewService({
        name: "",
        category: "",
        base_price: 0,
        duration: null,
        delivery: "",
      });
  
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (serviceId: number) => {
    const confirmed = confirm("Are you sure you want to delete this service?");
    if (!confirmed) return;

    const token = getToken();
    if (!token) return router.push("/login");

    setActionLoading(serviceId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete service");
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingService) return;
  
    const token = getToken();
    if (!token) return router.push("/login");
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/${editingService.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingService),
        }
      );
  
      if (!res.ok) throw new Error("Failed to update service");
  
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? { ...s, ...editingService }
            : s
        )
      );
  
      setShowEditModal(false);
      setEditingService(null);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <p className="p-6 text-center text-white">Loading services...</p>;

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Services</h1>
          <button
            className="bg-[#D4AF37] text-black px-4 py-2 rounded w-full sm:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            Add Service
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          {services.filter((s) => s && s.id).map((service) => (
            <div
              key={service.id}
              className="bg-neutral-900 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{service.name}</span>
                <span className="text-gray-400">{service.category}</span>
                <span className="text-[#D4AF37] font-medium">${service.base_price}</span>
                <span className="text-gray-400">
                  {service.duration ? `${service.duration} mins` : "-"}
                </span>
                <span className="text-gray-400">{service.delivery}</span>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                    onClick={() => {
                        setEditingService(service);
                        setShowEditModal(true);
                    }}
                    className="bg-blue-600 px-3 py-1 rounded w-full sm:w-auto"
                    >
                    Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={actionLoading === service.id}
                  className={`bg-red-600 px-3 py-1 rounded w-full sm:w-auto ${
                    actionLoading === service.id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {actionLoading === service.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="p-2 rounded bg-neutral-800 text-white"
              />
              <input
                type="text"
                placeholder="Category"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                className="p-2 rounded bg-neutral-800 text-white"
              />
              <input
                type="number"
                placeholder="Price"
                value={newService.base_price}
                onChange={(e) => setNewService({ ...newService, base_price: Number(e.target.value) })}
                className="p-2 rounded bg-neutral-800 text-white"
              />
              <input
                type="number"
                placeholder="Duration (mins)"
                value={newService.duration ?? ""}
                onChange={(e) =>
                    setNewService({
                    ...newService,
                    duration: e.target.value === "" ? null : Number(e.target.value),
                    })
                }
                className="p-2 rounded bg-neutral-800 text-white"
                />
              <input
                type="text"
                placeholder="Delivery"
                value={newService.delivery}
                onChange={(e) => setNewService({ ...newService, delivery: e.target.value })}
                className="p-2 rounded bg-neutral-800 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="bg-[#D4AF37] text-black px-4 py-2 rounded"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

        {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
            <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4 text-center">
                Edit Service
            </h2>

            <div className="flex flex-col gap-3">

                {/* Name */}
                <input
                type="text"
                value={editingService.name}
                onChange={(e) =>
                    setEditingService({
                    ...editingService,
                    name: e.target.value,
                    })
                }
                className="p-3 rounded bg-neutral-800 text-white"
                />

                {/* Category */}
                <input
                type="text"
                value={editingService.category}
                onChange={(e) =>
                    setEditingService({
                    ...editingService,
                    category: e.target.value,
                    })
                }
                className="p-3 rounded bg-neutral-800 text-white"
                />

                {/* Price */}
                <input
                type="number"
                value={editingService.base_price}
                onChange={(e) =>
                    setEditingService({
                    ...editingService,
                    base_price: Number(e.target.value),
                    })
                }
                className="p-3 rounded bg-neutral-800 text-white"
                />

                {/* Duration */}
                <input
                type="number"
                value={editingService.duration ?? ""}
                onChange={(e) =>
                    setEditingService({
                    ...editingService,
                    duration:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                }
                className="p-3 rounded bg-neutral-800 text-white"
                />

                {/* Delivery */}
                <input
                type="text"
                value={editingService.delivery}
                onChange={(e) =>
                    setEditingService({
                    ...editingService,
                    delivery: e.target.value,
                    })
                }
                className="p-3 rounded bg-neutral-800 text-white"
                />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
                <button
                onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                }}
                className="bg-gray-700 px-4 py-2 rounded"
                >
                Cancel
                </button>

                <button
                onClick={handleUpdate}
                className="bg-[#D4AF37] text-black px-4 py-2 rounded"
                >
                Save Changes
                </button>
            </div>

            </div>
        </div>
        )}
    </main>
  );
}

