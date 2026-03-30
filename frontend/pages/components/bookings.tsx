'use client';

import React from "react";
import { useEffect, useState } from "react";


interface Bookings {
    id: number;
    service_id: number;
    booking_date: string,
    start_time: string;
    client_name: string,
    client_email: string,
    client_phone: string,
    location: string,
    notes: string,
    total_amount: string,
    payment_status: string,
    created_at: string,
}

  
export default function Bookings() {
    const [booking, setBookings] = useState<Bookings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewId, setViewId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const currentBookings = booking.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.max(1, Math.ceil(booking.length / rowsPerPage));

    const fetchBookings = async () => {
        setLoading(true);
    
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`);
          if (!res.ok) throw new Error("Failed to fetch bookings");
          const data = await res.json();
          const mapped = data.map((book: any) => ({
            id: book.id,
            service_id: book.service_id,
            booking_date: book.booking_date,
            start_time: book.start_time,
            client_name: book.client_name,
            client_email: book.client_email,
            client_phone: book.client_phone,
            location: book.location,
            notes: book.notes,
            total_amount: book.total_amount,
            payment_status: book.payment_status,
            created_at: book.created_at,   
          }));      
          setBookings(mapped);
        } catch (err) {
          console.error(err);
          setError("Failed to load bookings");
        } finally {
          setLoading(false);
        }
    };

    const handleDeleteBooking = async (id: number) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`,
            { method: "DELETE" }
          );
      
          if (!res.ok) throw new Error("Failed to delete");
      
          setBookings(prev => {
            const updated = prev.filter(b => b.id !== id);
      
            const newTotalPages = Math.ceil(updated.length / rowsPerPage);
            if (currentPage > newTotalPages) {
              setCurrentPage(newTotalPages || 1);
            }
      
            return updated;
          });
      
        } catch (err) {
          console.error(err);
        }
      };
    
    const handleViewToggle = (id: number) => {
    setViewId(prev => (prev === id ? null : id));
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString();
      
    const formatTime = (time: string) => {
        const [h, m] = time.split(":");
        const hour = Number(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        return `${hour % 12 || 12}:${m} ${ampm}`;
    };

    useEffect(() => {
    fetchBookings();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, [currentPage]);

    return (
        <>
        {loading ? (
          <p>Loading Bookings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : booking.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <>
            {/* Mobile Messages */}
            <div className="sm:hidden space-y-4 mb-6">
                {currentBookings.map((book) => (
                  <div key={book.id} className="bg-[#1a1a1a] p-4 rounded border border-neutral-800">
                    
                    <p className="text-sm text-neutral-400">Booking ID</p>
                    <p className="mb-2">{book.id}</p>

                    <p className="text-sm text-neutral-400">Service ID</p>
                    <p className="mb-2">{book.service_id}</p>
  
                    <p className="text-sm text-neutral-400">Booking Date</p>
                    <p className="mb-2">{formatDate(book.booking_date)}</p>
  
                    <p className="text-sm text-neutral-400">Booking Time</p>
                    <p className="mb-2 break-all">{formatTime(book.start_time)}</p>
  
                    <p className="text-sm text-neutral-400">Client Name</p>
                    <p className="mb-2">{book.client_name}</p>
  
                    <p className="text-sm text-neutral-400">Client Email</p>
                    <p className="mb-2">{book.client_email}</p>
  
                    <p className="text-sm text-neutral-400">Client Phone</p>
                    <p className="mb-3 capitalize">{book.client_phone}</p>

                    <p className="text-sm text-neutral-400">Booking location</p>
                    <p className="mb-3 capitalize">{book.location}</p>

                    <p className="text-sm text-neutral-400">Booking Notes</p>
                    <p className="mb-3 capitalize">{book.notes}</p>

                    <p className="text-sm text-neutral-400">Payment status</p>
                    <p className="mb-3 capitalize">{book.payment_status}</p>
  
                    <p className="text-sm text-neutral-400">Created At</p>
                    <p className="mb-3">{new Date(book.created_at).toLocaleString()}</p>

                    <div className="flex flex-wrap gap-2">  
                        <button
                            onClick={() => handleDeleteBooking(book.id)}
                            className="bg-red-600 px-3 py-1 rounded"
                        >
                            Delete
                        </button>
  
                    </div>
                  </div>
                ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-neutral-800 mb-6">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-[#2c2c2c] text-white">
                  <tr>
                    <th className="py-3 px-4 w-[70px]">ID</th>
                    <th className="py-3 px-4 w-[90px]">Service_ID</th>
                    <th className="py-3 px-4 w-[110px]">Date</th>
                    <th className="py-3 px-4 w-[90px]">Time</th>
                    <th className="py-3 px-4 w-[140px]">Name</th>
                    <th className="py-3 px-4 w-[180px]">Email</th>
                    <th className="py-3 px-4 w-[120px]">Phone</th>
                    <th className="py-3 px-4 w-[180px]">Location</th>
                    <th className="py-3 px-4 w-[200px]">Notes</th>
                    <th className="py-3 px-4 w-[100px]">Status</th>
                    <th className="py-3 px-4 w-[150px]">Created</th>
                    <th className="py-3 px-4 w-[130px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {currentBookings.map((book, idx) => (
                  <React.Fragment key={book.id}>
                    {/* Main Row */}
                    <tr className={`${idx % 2 === 0 ? "bg-black" : "bg-[#1a1a1a]"} hover:bg-[#2a2a2a]`}>
                      <td className="py-2 px-4 truncate max-w-[70px]">{book.id}</td>
                      <td className="py-2 px-4 truncate max-w-[90px]">{book.service_id}</td>
                      <td className="py-2 px-4 truncate max-w-[110px]">{formatDate(book.booking_date)}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{formatTime(book.start_time)}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{book.client_name}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{book.client_email}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{book.client_phone}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{book.location}</td>
                      <td className="py-2 px-4 truncate max-w-[120px]">{book.notes}</td>
                      <td className={`capitalize ${
                        book.payment_status === "paid"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}>
                        {book.payment_status}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        {new Date(book.created_at).toLocaleString()}
                      </td>
  
                      <td className="py-2 px-4 text-center space-x-2">
  
                        <button
                            onClick={() => handleDeleteBooking(book.id)}
                            className="bg-red-600 px-3 py-1 rounded"
                        >
                            Delete
                        </button>
  
                        <button
                          onClick={() => handleViewToggle(book.id)}
                          className="bg-gray-700 px-3 py-1 rounded"
                        >
                          {viewId === book.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
  
                    {/* Expanded View Row */}
                    {viewId === book.id && (
                        <tr className="bg-[#111]">
                            <td colSpan={12} className="p-6">
                            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-neutral-800">
                                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
                                Booking Details
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-neutral-400">Client Name</p>
                                    <p>{book.client_name}</p>
                                </div>

                                <div>
                                    <p className="text-neutral-400">Email</p>
                                    <p>{book.client_email || "-"}</p>
                                </div>

                                <div>
                                    <p className="text-neutral-400">Phone</p>
                                    <p>{book.client_phone || "-"}</p>
                                </div>

                                <div>
                                    <p className="text-neutral-400">Status</p>
                                    <p className="capitalize">{book.payment_status}</p>
                                </div>
                                </div>

                                <div className="mt-4">
                                <p className="text-neutral-400 mb-1">Notes</p>
                                <p>{book.notes || "-"}</p>
                                </div>
                            </div>
                            </td>
                        </tr>
                    )}
                  </React.Fragment>
                ))}
  
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="text-sm text-neutral-400">
                    Showing {indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, booking.length)} of {booking.length}
                </span>

                <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                >
                    Next
                </button>
                </div>
          </>
        )}
      </>
    )
}
