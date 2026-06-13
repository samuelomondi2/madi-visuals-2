'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  duration?: number;
  base_price: number;
  delivery: string;
  category: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceForm {
  name: string;
  duration: string;
  base_price: string;
  delivery: string;
  category: string;
  customCategory?: string;
}

const emptyForm: ServiceForm = {
  name: "",
  duration: "",
  base_price: "",
  delivery: "",
  category: "",
  customCategory: "",
};

function CategorySelect({
  value, customValue, categories, inputClass, onChange, onCustomChange,
}: {
  value: string;
  customValue?: string;
  categories: string[];
  inputClass: string;
  onChange: (val: string) => void;
  onCustomChange: (val: string) => void;
}) {
  return (
    <>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        <option value="__new__">+ Other (type below)</option>
      </select>
      {value === "__new__" && (
        <input
          className={`${inputClass} mt-2`}
          placeholder="Enter new category"
          value={customValue ?? ""}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      )}
    </>
  );
}

export default function AdminServices() {
  const [services, setServices]         = useState<Service[]>([]);
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [editId, setEditId]             = useState<string | null>(null);
  const [form, setForm]                 = useState<ServiceForm>(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState<ServiceForm>(emptyForm);
  const [adding, setAdding]             = useState(false);
  const [addError, setAddError]         = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const existingCategories = useMemo(
    () => [...new Set(services.map((s) => s.category).filter(Boolean))],
    [services]
  );

  const filteredServices = useMemo(() => {
    if (activeFilter === "active")   return services.filter((s) => s.is_active);
    if (activeFilter === "inactive") return services.filter((s) => !s.is_active);
    return services;
  }, [services, activeFilter]);

  const counts = useMemo(() => ({
    all:      services.length,
    active:   services.filter((s) => s.is_active).length,
    inactive: services.filter((s) => !s.is_active).length,
  }), [services]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data.map((s: any) => ({
        id:         s._id,
        name:       s.name,
        duration:   s.duration,
        base_price: s.base_price,
        delivery:   s.delivery,
        category:   s.category,
        is_active:  s.is_active,
        createdAt:  s.createdAt,
        updatedAt:  s.updatedAt,
      })));
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleEdit = (service: Service) => {
    setEditId(service.id);
    setForm({
      name:           service.name,
      duration:       service.duration?.toString() || "",
      base_price:     service.base_price.toString(),
      delivery:       service.delivery,
      category:       service.category,
      customCategory: "",
    });
  };

  const handleSave = async (id: string) => {
    const token   = getToken();
    const service = services.find((s) => s.id === id);
    setSaving(true);
    const resolvedCategory = form.category === "__new__"
      ? form.customCategory || "" : form.category;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:       form.name,
          duration:   form.duration ? Number(form.duration) : undefined,
          base_price: Number(form.base_price),
          delivery:   form.delivery,
          category:   resolvedCategory,
          is_active:  service?.is_active,
        }),
      });
      if (!res.ok) throw new Error("Failed to update service");
      setServices((prev) =>
        prev.map((s) => s.id === id ? {
          ...s,
          name:       form.name,
          duration:   form.duration ? Number(form.duration) : undefined,
          base_price: Number(form.base_price),
          delivery:   form.delivery,
          category:   resolvedCategory,
        } : s)
      );
      setEditId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const token   = getToken();
    const service = services.find((s) => s.id === id);
    if (!service) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:       service.name,
          duration:   service.duration,
          base_price: service.base_price,
          delivery:   service.delivery,
          category:   service.category,
          is_active:  !current,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle service");
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, is_active: !current } : s)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete service");
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  const handleAddService = async () => {
    setAddError(null);
    if (!addForm.name || !addForm.base_price) {
      setAddError("Name and base price are required.");
      return;
    }
    const resolvedCategory = addForm.category === "__new__"
      ? addForm.customCategory || "" : addForm.category;
    const token = getToken();
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:       addForm.name,
          duration:   addForm.duration ? Number(addForm.duration) : undefined,
          base_price: Number(addForm.base_price),
          delivery:   addForm.delivery,
          category:   resolvedCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to add service");
      const { service } = await res.json();
      setServices((prev) => [...prev, {
        id:         service._id,
        name:       service.name,
        duration:   service.duration,
        base_price: service.base_price,
        delivery:   service.delivery,
        category:   service.category,
        is_active:  service.is_active,
        createdAt:  service.createdAt,
        updatedAt:  service.updatedAt,
      }]);
      setAddForm(emptyForm);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      setAddError("Failed to add service");
    } finally {
      setAdding(false);
    }
  };

  const inputClass = "w-full rounded bg-neutral-800 border border-neutral-700 text-white text-sm p-2 focus:border-[#D4AF37] outline-none";

  if (loading) return <p className="text-white">Loading services...</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Services</h1>
        <button
          onClick={() => { setShowAddModal(true); setAddForm(emptyForm); setAddError(null); }}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded font-semibold w-full sm:w-auto hover:opacity-90 transition"
        >
          + Add Service
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded text-sm capitalize transition ${
              activeFilter === f
                ? "bg-[#D4AF37] text-black font-semibold"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {f} <span className="text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-lg relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-white text-lg font-bold">×</button>
            <h2 className="text-xl font-bold text-[#D4AF37] mb-4">Add New Service</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Name *</label>
                <input className={inputClass} value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Category</label>
                <CategorySelect
                  value={addForm.category} customValue={addForm.customCategory}
                  categories={existingCategories} inputClass={inputClass}
                  onChange={(val) => setAddForm({ ...addForm, category: val })}
                  onCustomChange={(val) => setAddForm({ ...addForm, customCategory: val })}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Base Price ($) *</label>
                <input className={inputClass} type="number" value={addForm.base_price} onChange={(e) => setAddForm({ ...addForm, base_price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Duration (mins)</label>
                <input className={inputClass} type="number" value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 mb-1 block">Delivery</label>
                <input className={inputClass} value={addForm.delivery} onChange={(e) => setAddForm({ ...addForm, delivery: e.target.value })} />
              </div>
            </div>
            {addError && <p className="text-red-500 text-sm mt-3">{addError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddService} disabled={adding} className="bg-[#D4AF37] text-black px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50">
                {adding ? "Adding..." : "Add Service"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Single service list using filteredServices */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <p className="text-neutral-400">No {activeFilter} services found.</p>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-neutral-900 p-4 rounded-lg border ${
                service.is_active ? "border-neutral-800" : "border-red-900 opacity-60"
              }`}
            >
              {editId === service.id ? (
                <div className="flex flex-col gap-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Name</label>
                      <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Category</label>
                      <CategorySelect
                        value={form.category} customValue={form.customCategory}
                        categories={existingCategories} inputClass={inputClass}
                        onChange={(val) => setForm({ ...form, category: val })}
                        onCustomChange={(val) => setForm({ ...form, customCategory: val })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Base Price ($)</label>
                      <input className={inputClass} type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Duration (mins)</label>
                      <input className={inputClass} type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-neutral-400 mb-1 block">Delivery</label>
                      <input className={inputClass} value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => handleSave(service.id)} disabled={saving} className="bg-[#D4AF37] text-black px-4 py-1.5 rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditId(null)} className="bg-neutral-700 text-white px-4 py-1.5 rounded text-sm hover:bg-neutral-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <p className="font-semibold text-lg text-white">{service.name}</p>
                    <p className="text-gray-400 text-sm">{service.category}</p>
                    <p className="text-[#D4AF37] font-medium">${service.base_price}</p>
                    <p className="text-gray-400 text-sm">
                      {service.duration ? `${service.duration} mins` : "No duration"} · {service.delivery}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      service.is_active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                    }`}>
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleEdit(service)} className="bg-[#D4AF37] text-black px-3 py-1.5 rounded text-sm font-semibold hover:opacity-90">Edit</button>
                    <button onClick={() => handleToggle(service.id, service.is_active)} className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-600">
                      {service.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="bg-red-700 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}