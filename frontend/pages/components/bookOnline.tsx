'use client';

import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}

interface BookingModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration?: number; 
}

interface FormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  service_id: string;
  notes: string;
  location: string;
  agreed_to_terms: boolean;
}

const defaultForm: FormData = {
  client_name: "",
  client_email: "",
  client_phone: "",
  booking_date: "",
  start_time: "",
  service_id: "",
  notes: "",
  location: "",
  agreed_to_terms: false,
};

export default function BookingModal({ open, setOpen }: BookingModalProps) {
  const [step, setStep]                        = useState(1);
  const [loading, setLoading]                  = useState(false);
  const [error, setError]                      = useState<string | null>(null);
  const [services, setServices]                = useState<ServiceOption[]>([]);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots]    = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots]        = useState(false);
  const [form, setForm]                        = useState<FormData>(defaultForm);

  const today = new Date().toISOString().split("T")[0];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const closeModal = () => {
    setOpen(false);
    setStep(1);
    setPendingBookingId(null);
    setForm(defaultForm);
    setError(null);
  };

  const updateForm = (field: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = Number(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
      if (!res.ok) throw new Error("Failed to fetch services");
      const data: any[] = await res.json();
      setServices(data.map((s) => ({
        id:       s._id,
        name:     s.name,
        price:    s.base_price ?? 0,
        duration: s.duration, 
      })));
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    }
  };

  const fetchAvailability = async (date: string, duration?: number) => {
    if (!date) return;
    try {
      setLoadingSlots(true);
      const params = new URLSearchParams({ date });
      if (duration) params.append("duration", duration.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/availability?${params}`
      );
      const data = await res.json();

      if (!data.available) {
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots(data.available_slots || []);
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();
          const address = data.status === "OK"
            ? data.results[0].formatted_address
            : `${lat},${lng}`;
          setForm((prev) => ({ ...prev, location: address }));
        } catch {
          setForm((prev) => ({ ...prev, location: `${lat},${lng}` }));
        }
      },
      (err) => console.error("Location error:", err)
    );
  };

  useEffect(() => {
    fetchServices();
    fetchLocation();
  }, []);

  useEffect(() => {
    updateForm("start_time", "");
    setAvailableSlots([]);
    if (form.booking_date) {
      const selected = services.find((s) => s.id === form.service_id);
      fetchAvailability(form.booking_date, selected?.duration); 
    }
  }, [form.booking_date, form.service_id]);

  const handlePendingBooking = async (): Promise<string | null> => {
    setError(null);
    const { client_name, client_email, booking_date, start_time, service_id, agreed_to_terms } = form;

    if (!client_name || !client_email || !booking_date || !start_time || !service_id) {
      setError("Please fill in all required fields.");
      return null;
    }
    if (!agreed_to_terms) {
      setError("You must agree to the Terms & Conditions.");
      return null;
    }

    const selectedService = services.find((s) => s.id === service_id);

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_amount: selectedService?.price ?? 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create booking");
      }

      const { booking } = await res.json();
      return booking._id;
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (bookingId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create Stripe session");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Stripe checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // const handleNext = async () => {
  //   if (step === 1) {
  //     const bookingId = await handlePendingBooking();
  //     if (bookingId) { setPendingBookingId(bookingId); nextStep(); }
  //   } else if (step === 2 && pendingBookingId) {
  //     await handleStripeCheckout(pendingBookingId);
  //   }
  // };

  const handleNext = async () => {
    if (step === 1) {
      const bookingId = await handlePendingBooking();
      if (bookingId) { setPendingBookingId(bookingId); nextStep(); }
    } else if (step === 2) {
      closeModal();
    }
  };

  const selectedService = services.find((s) => s.id === form.service_id);
  const inputClass = "rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:block rounded-lg border border-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
      >
        Book Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 min-h-screen"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-black text-white rounded-xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
              aria-label="Close modal"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-1 text-[#D4AF37]">Book a Session</h2>
            <p className="mb-4 text-gray-300 text-sm">Fill out the form below and proceed to payment.</p>

            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <>
                  <input type="text"  placeholder="Full Name *"  value={form.client_name}  onChange={(e) => updateForm("client_name",  e.target.value)} required className={inputClass} />
                  <input type="email" placeholder="Email *"      value={form.client_email} onChange={(e) => updateForm("client_email", e.target.value)} required className={inputClass} />
                  <input type="tel"   placeholder="Phone"        value={form.client_phone} onChange={(e) => updateForm("client_phone", e.target.value)}         className={inputClass} />
                  {/* <input type="text"  placeholder="Location *"   value={form.location}     onChange={(e) => updateForm("location",     e.target.value)} required className={inputClass} /> */}

                  <select value={form.service_id} onChange={(e) => updateForm("service_id", e.target.value)} required className={inputClass}>
                    <option value="">Select Service *</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ${s.price}{s.duration ? ` (${s.duration} mins)` : ""}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={form.booking_date}
                      onChange={(e) => updateForm("booking_date", e.target.value)}
                      required
                      min={today}
                      className={`${inputClass} flex-1`}
                    />
                    <select
                      value={form.start_time}
                      onChange={(e) => updateForm("start_time", e.target.value)}
                      disabled={!form.booking_date || loadingSlots}
                      required
                      className={inputClass}
                    >
                      <option value="">
                        {loadingSlots                 ? "Loading..."             :
                         !form.booking_date           ? "Select a date first"    :
                         availableSlots.length === 0  ? "No times available"     :
                         "Select Time *"}
                      </option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>{formatTime(slot)}</option>
                      ))}
                    </select>
                  </div>

                  <textarea placeholder="Notes" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className={inputClass} rows={3} />

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={form.agreed_to_terms}
                      onChange={(e) => updateForm("agreed_to_terms", e.target.checked)}
                      className="accent-[#D4AF37] w-4 h-4"
                    />
                    <label htmlFor="agree" className="text-sm text-gray-300">
                      I agree to the{" "}
                      <a href="/faq" className="underline hover:text-[#D4AF37]">Terms & Conditions</a>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 mt-2 hover:opacity-90 transition disabled:opacity-50">
                    {loading ? "Saving..." : "Next →"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-neutral-900 p-4 rounded-lg text-sm text-white space-y-1">
                    <p><strong>Name:</strong> {form.client_name}</p>
                    <p><strong>Email:</strong> {form.client_email}</p>
                    {form.client_phone && <p><strong>Phone:</strong> {form.client_phone}</p>}
                    {/* <p><strong>Location:</strong> {form.location}</p> */}
                    <p><strong>Date & Time:</strong> {form.booking_date} at {formatTime(form.start_time)}</p>
                    <p><strong>Service:</strong> {selectedService?.name}{selectedService?.duration ? ` (${selectedService.duration} mins)` : ""}</p>
                    <p><strong>Price:</strong> ${selectedService?.price}</p>
                    {form.notes && <p><strong>Notes:</strong> {form.notes}</p>}
                  </div>

                  <div className="flex justify-between mt-2">
                    <button type="button" onClick={prevStep} className="rounded-lg border border-[#D4AF37] text-[#D4AF37] font-semibold py-2 px-4 hover:bg-[#D4AF37] hover:text-black transition">
                      ← Back
                    </button>
                    {/* <button type="submit" disabled={loading || !pendingBookingId} className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 px-4 hover:opacity-90 transition disabled:opacity-50">
                      {loading ? "Redirecting..." : "Pay with Stripe"}
                    </button> */}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 px-4 hover:opacity-90 transition"
                    >
                      Exit
                    </button>
                  </div>
                </>
              )}
            </form>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}