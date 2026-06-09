'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface ContactMessage {
  id: string; 
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "pending" | "reviewed";
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
}

export default function Contact() {
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [viewId, setViewId]       = useState<string | null>(null);
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      const mapped: ContactMessage[] = data.map((msg: any) => ({
        id:         msg._id,
        name:       msg.name,
        email:      msg.email,
        phone:      msg.phone,
        message:    msg.message,
        status:     msg.status,
        createdAt:  msg.createdAt,
        updatedAt:  msg.updatedAt,
        is_deleted: msg.is_deleted,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDeleteMessage = async (id: string) => {
    const token = getToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (viewId === id) setViewId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  const toggleStatus = async (id: string, currentStatus: "pending" | "reviewed") => {
    if (currentStatus !== "pending") return;
    const token = getToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}/reviewed`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to update status");

      setMessages((prev) =>
        prev.map((msg) => msg.id === id ? { ...msg, status: "reviewed" } : msg)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleViewToggle = (id: string) =>
    setViewId(viewId === id ? null : id);

  return (
    <>
      {loading ? (
        <p>Loading messages...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-4 mb-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-[#1a1a1a] p-4 rounded border border-neutral-800">
                <p className="text-sm text-neutral-400">Name</p>
                <p className="mb-2">{msg.name}</p>

                <p className="text-sm text-neutral-400">Email</p>
                <p className="mb-2 break-all">{msg.email}</p>

                <p className="text-sm text-neutral-400">Phone</p>
                <p className="mb-2">{msg.phone || "-"}</p>

                <p className="text-sm text-neutral-400">Message</p>
                <p className="mb-2">{msg.message}</p>

                <p className="text-sm text-neutral-400">Status</p>
                <p className="mb-3 capitalize">{msg.status}</p>

                <p className="text-sm text-neutral-400">Date</p>
                <p className="mb-3">{new Date(msg.createdAt).toLocaleString()}</p>

                <div className="flex flex-wrap gap-2">
                  {msg.status === "pending" && (
                    <button
                      onClick={() => toggleStatus(msg.id, msg.status)}
                      className="bg-[#D4AF37] text-black px-3 py-1 rounded"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {!msg.is_deleted && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-neutral-800 mb-6">
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
                {messages.map((msg, idx) => (
                  <React.Fragment key={msg.id}>
                    <tr className={idx % 2 === 0 ? "bg-black" : "bg-[#1a1a1a]"}>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.name}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.email}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.phone || "-"}</td>
                      <td className="py-2 px-4 truncate max-w-xs">{msg.message}</td>
                      <td className="py-2 px-4 capitalize">{msg.status}</td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-center space-x-2">
                        {msg.status === "pending" && (
                          <button
                            onClick={() => toggleStatus(msg.id, msg.status)}
                            className="bg-[#D4AF37] text-black px-3 py-1 rounded"
                          >
                            Mark as Reviewed
                          </button>
                        )}
                        {!msg.is_deleted && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="bg-red-600 px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => handleViewToggle(msg.id)}
                          className="bg-gray-700 px-3 py-1 rounded"
                        >
                          {viewId === msg.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {viewId === msg.id && (
                      <tr className="bg-[#111]">
                        <td colSpan={7} className="p-6">
                          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-neutral-800">
                            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
                              Message Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-neutral-400">Name</p>
                                <p>{msg.name}</p>
                              </div>
                              <div>
                                <p className="text-neutral-400">Email</p>
                                <p>{msg.email}</p>
                              </div>
                              <div>
                                <p className="text-neutral-400">Phone</p>
                                <p>{msg.phone || "-"}</p>
                              </div>
                              <div>
                                <p className="text-neutral-400">Status</p>
                                <p className="capitalize">{msg.status}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-neutral-400 mb-1">Message</p>
                              <p className="leading-relaxed">{msg.message}</p>
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
        </>
      )}
    </>
  );
}