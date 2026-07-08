'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface ServiceInfo {
  id: string;
  name: string;
  duration?: number;
  base_price: number;
  category: string;
}

interface Booking {
  id: string;
  service: ServiceInfo;
  booking_date: string;
  start_time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  location: string;
  notes?: string;
  total_amount: number;
  payment_status: "pending" | "paid" | "cancelled" | "refunded";
  booking_status: "pending" | "confirmed" | "completed" | "cancelled";
  agreed_to_terms: boolean;
  createdAt: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  pending:   "bg-yellow-900 text-yellow-300",
  paid:      "bg-green-900 text-green-300",
  cancelled: "bg-red-900 text-red-300",
  refunded:  "bg-blue-900 text-blue-300",
};

const BOOKING_COLORS: Record<string, string> = {
  pending:   "bg-yellow-900 text-yellow-300",
  confirmed: "bg-green-900 text-green-300",
  completed: "bg-blue-900 text-blue-300",
  cancelled: "bg-red-900 text-red-300",
};

export default function Bookings() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [viewId, setViewId]       = useState<string | null>(null);
  const [filter, setFilter]       = useState<string>("all");
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();

      setBookings(data.map((b: any) => ({
        id:             b._id,
        service: {
          id:        b.service_id?._id,
          name:      b.service_id?.name,
          duration:  b.service_id?.duration,
          base_price: b.service_id?.base_price,
          category:  b.service_id?.category,
        },
        booking_date:    b.booking_date,
        start_time:      b.start_time,
        client_name:     b.client_name,
        client_email:    b.client_email,
        client_phone:    b.client_phone,
        location:        b.location,
        notes:           b.notes,
        total_amount:    b.total_amount,
        payment_status:  b.payment_status,
        booking_status:  b.booking_status,
        agreed_to_terms: b.agreed_to_terms,
        createdAt:       b.createdAt,
      })));
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateBookingStatus = async (id: string, booking_status: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, booking_status: booking_status as Booking["booking_status"] } : b)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status");
    }
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status }),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, payment_status: payment_status as Booking["payment_status"] } : b)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update payment status");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (viewId === id) setViewId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking");
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = Number(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.booking_status === filter);

  if (loading) return <p className="text-white">Loading bookings...</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Bookings</h1>
        <span className="text-neutral-400 text-sm">{bookings.length} total</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm capitalize transition ${
              filter === f
                ? "bg-[#D4AF37] text-black font-semibold"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-400">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <React.Fragment key={booking.id}>
              <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

                  {/* Info */}
                  <div className="space-y-1">
                    <p className="font-semibold text-white text-lg">{booking.client_name}</p>
                    <p className="text-gray-400 text-sm">{booking.client_email} · {booking.client_phone}</p>
                    <p className="text-gray-400 text-sm">
                      {booking.service?.name}
                      {booking.service?.duration ? ` (${booking.service.duration} mins)` : ""}
                      {" · "}{booking.service?.category}
                    </p>
                    <p className="text-[#D4AF37] font-medium">${booking.total_amount}</p>
                    <p className="text-gray-400 text-sm">
                      {booking.booking_date} at {formatTime(booking.start_time)}
                    </p>

                    {/* Status badges */}
                    <div className="flex gap-2 flex-wrap mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${BOOKING_COLORS[booking.booking_status]}`}>
                        {booking.booking_status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_COLORS[booking.payment_status]}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setViewId(viewId === booking.id ? null : booking.id)}
                      className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-600"
                    >
                      {viewId === booking.id ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="bg-red-700 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {viewId === booking.id && (
                <div className="bg-[#111] border border-neutral-800 rounded-lg p-6 -mt-2">
                  <h3 className="text-[#D4AF37] font-semibold text-lg mb-4">Booking Details</h3>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div><p className="text-neutral-400">Client</p><p>{booking.client_name}</p></div>
                    <div><p className="text-neutral-400">Email</p><p>{booking.client_email}</p></div>
                    <div><p className="text-neutral-400">Phone</p><p>{booking.client_phone}</p></div>
                    <div><p className="text-neutral-400">Location</p><p>{booking.location}</p></div>
                    <div><p className="text-neutral-400">Date & Time</p><p>{booking.booking_date} at {formatTime(booking.start_time)}</p></div>
                    <div><p className="text-neutral-400">Service</p><p>{booking.service?.name}</p></div>
                    <div><p className="text-neutral-400">Amount</p><p>${booking.total_amount}</p></div>
                    <div><p className="text-neutral-400">Agreed to Terms</p><p>{booking.agreed_to_terms ? "Yes" : "No"}</p></div>
                    {booking.notes && <div className="sm:col-span-2"><p className="text-neutral-400">Notes</p><p>{booking.notes}</p></div>}
                  </div>

                  {/* Status controls */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-neutral-400 text-xs mb-1">Booking Status</p>
                      <select
                        value={booking.booking_status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white text-sm p-2 focus:border-[#D4AF37] outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-xs mb-1">Payment Status</p>
                      <select
                        value={booking.payment_status}
                        onChange={(e) => updatePaymentStatus(booking.id, e.target.value)}
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white text-sm p-2 focus:border-[#D4AF37] outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
}