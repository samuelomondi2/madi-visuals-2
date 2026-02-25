'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import React from "react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  const fetchMessages = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      const mapped = data.contacts.map((msg: any) => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        message: msg.message,
        status: msg.status,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: number) => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages(messages.filter((msg) => msg.id !== id));
      if (viewId === id) setViewId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  const toggleStatus = async (id: number, currentStatus: "pending" | "resolved") => {
    const token = getToken();
    const newStatus = currentStatus === "pending" ? "resolved" : "pending";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setMessages(
        messages.map((msg) =>
          msg.id === id ? { ...msg, status: newStatus } : msg
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleViewToggle = (id: number) => {
    setViewId(viewId === id ? null : id);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filter & sort messages
  const filteredMessages = messages.filter((msg) => {
    const statusMatch = statusFilter === "all" || msg.status === statusFilter;
  
    // Convert createdAt to Date for comparison
    const msgDate = new Date(msg.createdAt);
  
    let dateMatch = true;
    if (startDate) {
      dateMatch = msgDate >= new Date(startDate);
    }
    if (endDate) {
      dateMatch = dateMatch && msgDate <= new Date(endDate);
    }
  
    return statusMatch && dateMatch;
  });
    // .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const paginatedMessages = filteredMessages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <p className="text-white p-4">Loading contact messages...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#D4AF37]">
        Contact Messages Dashboard
      </h2>

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div>
              <label className="mr-2">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black border border-neutral-700 px-2 py-1 rounded text-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="mr-2">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black border border-neutral-700 px-2 py-1 rounded text-white"
              />
            </div>

            <div>
              <label className="mr-2">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black border border-neutral-700 px-2 py-1 rounded text-white"
              />
            </div>
          </div>

          {/* Table & Cards */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-800">
            <table className="min-w-full table-fixed border-collapse">
              <thead className="bg-[#2c2c2c] text-white">
                <tr>
                  <th className="py-3 px-4 text-left rounded-tl-lg">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Message</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMessages.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-4">
                      No messages match the filters.
                    </td>
                  </tr>
                )}
                {paginatedMessages.map((msg, idx) => (
                  <React.Fragment key={msg.id}>
                    <tr className={idx % 2 === 0 ? "bg-black" : "bg-[#1a1a1a]"}>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.name}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.email}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.phone || "-"}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.message}</td>
                      <td className="py-2 px-4 capitalize">{msg.status}</td>
                      <td className="py-2 px-4 whitespace-nowrap">{new Date(msg.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center space-x-2">
                        <button
                          onClick={() => toggleStatus(msg.id, msg.status)}
                          className="bg-[#D4AF37] text-black px-3 py-1 rounded hover:opacity-90 transition"
                        >
                          {msg.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="bg-red-600 px-3 py-1 rounded hover:opacity-90 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleViewToggle(msg.id)}
                          className="bg-gray-700 px-3 py-1 rounded hover:opacity-90 transition"
                        >
                          {viewId === msg.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {viewId === msg.id && (
                      <tr className={idx % 2 === 0 ? "bg-[#111]" : "bg-[#222]"}>
                        <td colSpan={7} className="p-4 text-sm">
                          <p><strong>Email:</strong> {msg.email}</p>
                          <p><strong>Phone:</strong> {msg.phone || "-"}</p>
                          <p><strong>Message:</strong> {msg.message}</p>
                          <p>
                            <strong>Status:</strong>{" "}
                            <span className={msg.status === "pending" ? "text-yellow-400" : "text-green-400"}>
                              {msg.status}
                            </span>
                          </p>
                          <p><strong>Created At:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                          <p><strong>Updated At:</strong> {new Date(msg.updatedAt).toLocaleString()}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedMessages.length === 0 && (
              <p className="text-gray-400 text-center">No messages match the filters.</p>
            )}
            {paginatedMessages.map((msg) => (
              <div key={msg.id} className="bg-[#1a1a1a] rounded-lg border border-neutral-700 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-[#D4AF37] truncate max-w-[60%]">{msg.name}</h3>
                  <div className="space-x-1">
                    <button
                      onClick={() => toggleStatus(msg.id, msg.status)}
                      className="bg-[#D4AF37] text-black px-2 py-1 rounded text-xs hover:opacity-90 transition"
                    >
                      {msg.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="bg-red-600 px-2 py-1 rounded text-xs hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleViewToggle(msg.id)}
                      className="bg-gray-700 px-2 py-1 rounded text-xs hover:opacity-90 transition"
                    >
                      {viewId === msg.id ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {viewId === msg.id && (
                  <div className="mt-2 space-y-1 text-sm text-white">
                    <p><strong>Email:</strong> {msg.email}</p>
                    <p><strong>Phone:</strong> {msg.phone || "-"}</p>
                    <p><strong>Message:</strong> {msg.message}</p>
                    <p><strong>Status:</strong> <span className={msg.status === "pending" ? "text-yellow-400" : "text-green-400"}>{msg.status}</span></p>
                    <p><strong>Created At:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                    <p><strong>Updated At:</strong> {new Date(msg.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${page === currentPage ? "bg-[#D4AF37] text-black" : "bg-gray-700"}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="bg-[#D4AF37] text-black px-5 py-2 rounded hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}