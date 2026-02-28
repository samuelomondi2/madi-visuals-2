'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHero from "./admin-hero";
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

export default function Dashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "media" | "hero">("messages");
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  /* -------------------- Fetching Data -------------------- */
  const fetchMessages = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return router.push("/login");

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

  const fetchMedia = async () => {
    setMediaLoading(true);
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch media files");
      const data = await res.json();
      setMediaFiles(data);
    } catch (err) {
      console.error(err);
      setMediaError("Failed to load media files");
    } finally {
      setMediaLoading(false);
    }
  };

  const fetchLatestVideo = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
    const data = await res.json();
    const latestVideo = data
      .filter((file: any) => file.file_type === "video")
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return latestVideo?.url || null;
  };

  useEffect(() => {
    fetchMessages();
    fetchMedia();
  }, []);

  /* -------------------- Actions -------------------- */
  const handleUpload = async () => {
  if (!uploadFile) return;
  const formData = new FormData();
  formData.append("file", uploadFile);

  const token = getToken();
  if (!token) {
    setUploadMessage("Not authorized");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ✅ Do NOT set Content-Type for FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const data = await res.json();
    setUploadMessage(data.message || "Upload successful");
    fetchMedia();
    } catch (err: any) {
      console.error(err);
      setUploadMessage(err.message || "Failed to upload file");
    }
  };

  const handleDeleteMessage = async (id: number) => {
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
      setMessages(messages.map((msg) =>
        msg.id === id ? { ...msg, status: newStatus } : msg
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleViewToggle = (id: number) => {
    setViewId(viewId === id ? null : id);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#D4AF37]">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-neutral-700">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 font-semibold rounded-t ${
            activeTab === "hero" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Hero
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 font-semibold rounded-t ${
            activeTab === "messages" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 font-semibold rounded-t ${
            activeTab === "media" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Media
        </button>
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === "hero" && <AdminHero />}
        {activeTab === "messages" && (
          <>
            {loading ? (
              <p>Loading messages...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              <>
                {/* Desktop Table */}
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
                            <td className="py-2 px-4 whitespace-nowrap">{new Date(msg.createdAt).toLocaleString()}</td>
                            <td className="py-2 px-4 text-center space-x-2">
                              <button
                                onClick={() => toggleStatus(msg.id, msg.status)}
                                className="bg-[#D4AF37] text-black px-3 py-1 rounded hover:opacity-90 transition"
                                aria-label={`Toggle status for message from ${msg.name}`}
                              >
                                {msg.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="bg-red-600 px-3 py-1 rounded hover:opacity-90 transition"
                                aria-label={`Delete message from ${msg.name}`}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleViewToggle(msg.id)}
                                className="bg-gray-700 px-3 py-1 rounded hover:opacity-90 transition"
                                aria-label={`${viewId === msg.id ? "Hide" : "View"} details for message from ${msg.name}`}
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
                                <p><strong>Status:</strong> {msg.status}</p>
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
                <div className="sm:hidden flex flex-col space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-[#1a1a1a] rounded p-4 shadow-md">
                      <p><strong>Name:</strong> {msg.name}</p>
                      <p><strong>Email:</strong> {msg.email}</p>
                      <p><strong>Phone:</strong> {msg.phone || "-"}</p>
                      <p><strong>Message:</strong> {msg.message}</p>
                      <p><strong>Status:</strong> {msg.status}</p>
                      <p><strong>Date:</strong> {new Date(msg.createdAt).toLocaleString()}</p>

                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => toggleStatus(msg.id, msg.status)}
                          className="bg-[#D4AF37] text-black px-3 py-1 rounded hover:opacity-90 transition flex-1"
                          aria-label={`Toggle status for message from ${msg.name}`}
                        >
                          {msg.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="bg-red-600 px-3 py-1 rounded hover:opacity-90 transition flex-1"
                          aria-label={`Delete message from ${msg.name}`}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleViewToggle(msg.id)}
                          className="bg-gray-700 px-3 py-1 rounded hover:opacity-90 transition flex-1"
                          aria-label={`${viewId === msg.id ? "Hide" : "View"} details for message from ${msg.name}`}
                        >
                          {viewId === msg.id ? "Hide" : "View"}
                        </button>
                      </div>

                      {viewId === msg.id && (
                        <div className="mt-3 bg-[#111] p-3 rounded text-sm space-y-1">
                          <p><strong>Updated At:</strong> {new Date(msg.updatedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
  </>
)}

        {activeTab === "media" && (
          <>
            {/* Upload Section */}
            <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="p-2 bg-black border border-neutral-700 rounded"
              />
              <button
                onClick={handleUpload}
                className="bg-[#D4AF37] px-4 py-2 text-black rounded hover:opacity-90 transition"
              >
                Upload
              </button>
              {uploadMessage && <span className="text-green-400">{uploadMessage}</span>}
            </div>

            {/* Media Grid */}
            {mediaLoading ? (
              <p>Loading media...</p>
            ) : mediaError ? (
              <p className="text-red-500">{mediaError}</p>
            ) : mediaFiles.length === 0 ? (
              <p>No media uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="bg-[#1a1a1a] p-2 rounded relative">
                    {file.file_type === "image" ? (
                      <img src={file.url} alt={file.original_name} className="w-full h-40 object-cover rounded"/>
                    ) : (
                      <video src={file.url} controls className="w-full h-40 rounded"/>
                    )}
                    <p className="text-xs text-neutral-400 truncate mt-1">{file.original_name}</p>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      <button
                        onClick={async () => {
                          const token = getToken();
                          if (!token) return;
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${file.id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error("Failed to delete media");
                            setMediaFiles(mediaFiles.filter((m) => m.id !== file.id));
                          } catch (err) {
                            console.error(err);
                            alert("Failed to delete media");
                          }
                        }}
                        className="bg-red-600 px-2 py-1 text-xs rounded hover:opacity-90"
                      >
                        Delete
                      </button>
                      <button
                        onClick={async () => {
                          const token = getToken();
                          if (!token) return;
                        
                          try {
                            const res = await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/hero/image/latest`,
                              {
                                method: "PATCH",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );
                        
                            if (!res.ok) throw new Error("Failed to set hero");
                        
                            alert("Hero updated successfully");
                          } catch (err) {
                            console.error(err);
                            alert("Failed to set hero");
                          }
                        }}
                      >
                        Set Hero
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Logout Button */}
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