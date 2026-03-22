'use client';

import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface BookingModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface ServiceMessage {
  id: number;
  name: string;
  price: number;
}

export default function BookingModal({ open, setOpen }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    booking_date: "",
    start_time: "",
    service_id: 0,
    notes: ""
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Fetch services including price
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

  // Step 1: Validate and create pending booking
  const handlePendingBooking = async (): Promise<number | null> => {
    setError("");
    if (!form.client_name || !form.client_email || !form.booking_date || !form.start_time || !form.service_id) {
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

  // Step 2: Redirect to Stripe Checkout
  const handleStripeCheckout = async (bookingId: number) => {
    try {
      setLoading(true);

      const selectedService = messages.find((s) => s.id === form.service_id);
      if (!selectedService) throw new Error("Invalid service selected");

      const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          items: [
            {
              name: selectedService.name,
              price: selectedService.price,
              quantity: 1
            }
          ]
        }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.message || "Failed to create Stripe Checkout session");
      }

      const { sessionId } = await sessionRes.json();
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start payment");
    } finally {
      setLoading(false);
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

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className={`h-2 rounded-full ${step >= 1 ? 'bg-[#D4AF37]' : 'bg-neutral-700'}`}></div>
                <p className="text-xs mt-1 text-center">Step 1: Info</p>
              </div>
              <div className="flex-1 mx-2">
                <div className={`h-2 rounded-full ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-neutral-700'}`}></div>
                <p className="text-xs mt-1 text-center">Step 2: Payment</p>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                    placeholder="Email Address"
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                  />

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={form.booking_date}
                      onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                      className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"
                      required
                    />
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"
                      required
                    />
                  </div>

                  <select
                    value={form.service_id}
                    onChange={(e) => setForm({ ...form, service_id: Number(e.target.value) })}
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    {messages.map((service) => (
                      <option key={service.id} value={service.id}>{service.name} - ${service.price}</option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Additional Notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 mt-4 hover:opacity-90 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-gray-300 text-sm mb-4">
                    Review your booking details and proceed to secure payment.
                  </p>

                  <div className="bg-neutral-900 p-4 rounded-lg mb-4 text-sm text-white">
                    <p><strong>Name:</strong> {form.client_name}</p>
                    <p><strong>Email:</strong> {form.client_email}</p>
                    {form.client_phone && <p><strong>Phone:</strong> {form.client_phone}</p>}
                    <p><strong>Date & Time:</strong> {form.booking_date} at {form.start_time}</p>
                    <p>
                      <strong>Service:</strong>{" "}
                      {messages.find((s) => s.id === form.service_id)?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Price:</strong> $
                      {messages.find((s) => s.id === form.service_id)?.price ?? 0}
                    </p>
                    {form.notes && <p><strong>Notes:</strong> {form.notes}</p>}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="rounded-lg border border-[#D4AF37] text-[#D4AF37] font-semibold py-2 px-4 hover:bg-[#D4AF37] hover:text-black transition"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !pendingBookingId}
                      className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 px-4 hover:opacity-90 transition disabled:opacity-50"
                    >
                      Pay with Stripe
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}