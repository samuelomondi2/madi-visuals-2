'use client';

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Load Stripe once (frontend only!)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BookingModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface ServiceMessage {
  id: number;
  name: string;
  price: number;
}

interface FormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  service_id: number;
  notes: string;
  location: string;
}

export default function BookingModal({ open, setOpen }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

  const [form, setForm] = useState<FormData>({
    client_name: "",
    client_email: "",
    client_phone: "",
    booking_date: "",
    start_time: "",
    service_id: 0,
    notes: "",
    location: ""
  });

  // Step controls
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setMessages(
        data.services.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.base_price ?? 0,
        }))
      );
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

  const handlePendingBooking = async (): Promise<number | null> => {
    setError("");
    const { client_name, client_email, booking_date, start_time, service_id } = form;
    if (!client_name || !client_email || !booking_date || !start_time || !service_id) {
      setError("Please fill in all required fields.");
      return null;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create pending booking");
      }

      const { booking } = await res.json();
      return booking.id;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (bookingId: number) => {
    try {
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
      console.error("Stripe checkout error:", err.message || err);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const bookingId = await handlePendingBooking();
      if (bookingId) {
        setPendingBookingId(bookingId);
        nextStep();
      }
    } else if (step === 2 && pendingBookingId) {
      await handleStripeCheckout(pendingBookingId);
    }
  };

  return (
    <>
      {/* Book Now Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:block rounded-lg border border-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
      >
        Book Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 min-h-screen"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setStep(1);
              setPendingBookingId(null);
            }
          }}
        >
          <div className="bg-black text-white rounded-xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setOpen(false); setStep(1); setPendingBookingId(null); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
              aria-label="Close modal"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-2 text-[#D4AF37]">Book a Session</h2>
            <p className="mb-4 text-gray-300 text-sm">
              Fill out the form below and proceed to payment.
            </p>

            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <>
                  {/* Step 1 Inputs */}
                  <input type="text" placeholder="Full Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"/>
                  <input type="email" placeholder="Email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} required className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"/>
                  <input type="tel" placeholder="Phone" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"/>
                  <div className="flex gap-2">
                    <input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} required className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"/>
                    <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"/>
                  </div>
                  <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: Number(e.target.value) })} required className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none">
                    <option value="">Select Service</option>
                    {messages.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
                  </select>
                  <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none" rows={3}/>
                  <button type="submit" disabled={loading} className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 mt-4 hover:opacity-90 transition disabled:opacity-50">Next</button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Step 2 Review + Payment */}
                  <div className="bg-neutral-900 p-4 rounded-lg mb-4 text-sm text-white">
                    <p><strong>Name:</strong> {form.client_name}</p>
                    <p><strong>Email:</strong> {form.client_email}</p>
                    {form.client_phone && <p><strong>Phone:</strong> {form.client_phone}</p>}
                    <p><strong>Date & Time:</strong> {form.booking_date} at {form.start_time}</p>
                    <p><strong>Service:</strong> {messages.find(s => s.id === form.service_id)?.name}</p>
                    <p><strong>Price:</strong> ${messages.find(s => s.id === form.service_id)?.price}</p>
                    {form.notes && <p><strong>Notes:</strong> {form.notes}</p>}
                  </div>
                  <div className="flex justify-between mt-4">
                    <button type="button" onClick={prevStep} className="rounded-lg border border-[#D4AF37] text-[#D4AF37] font-semibold py-2 px-4 hover:bg-[#D4AF37] hover:text-black transition">Back</button>
                    <button type="submit" disabled={loading || !pendingBookingId} className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 px-4 hover:opacity-90 transition disabled:opacity-50">Pay with Stripe</button>
                  </div>
                </>
              )}
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}