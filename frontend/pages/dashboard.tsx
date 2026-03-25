'use client';

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminHero from "./admin-hero";
import React from "react";
import AvailabilityPage from "./availability";
import AdminServices from "./admin-services";
import Bookings from "./components/bookings";
import DashboardStats from "./components/dashboard-stats";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "pending" | "reviewed";
  createdAt: string;
  updatedAt: string;
  deleted?: 0 | 1;     
  deletedAt?: string | null; 
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
  const [activeTab, setActiveTab] = useState< "stats" |"messages" | "media" | "availability" | "services" | "bookings" | "hero">("messages");
  const [videoUrlInput, setVideoUrlInput] = useState<string>("");
  const [currentHero, setCurrentHero] = useState<{ type: "image" | "video"; url: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        deleted: msg.deleted,       
        deletedAt: msg.deleted_at,   
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

  const fetchEmail = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.email) setEmail(data.email);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      toast.success(data.message);
    } catch (err) {
      toast.error("Failed to update email credentials");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentHero = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero/hero-video`);
      if (!res.ok) throw new Error("Failed to fetch current hero");
      const data = await res.json();
      setCurrentHero(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFilteredMessages = async (status?: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contact?status=${status}&deleted=0`
    );
  
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    fetchMedia();
    fetchCurrentHero();
    fetchFilteredMessages();
    fetchEmail();
  }, []);

  /* -------------------- Actions -------------------- */

  const handleUpload = async (file: File) => {
    const token = getToken();
    if (!token) {
      setUploadMessage("Not authorized");
      return;
    }
  
    try {
      setUploadMessage("Uploading file...");
  
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      const data = await res.json();
      setUploadMessage(data.message || "Upload successful");
      fetchMedia();
    } catch (err) {
      console.error(err);
      setUploadMessage("Failed to upload file");
    }
  };

  const handleDeleteMessage = async (id: number) => {
    const token = getToken();
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}/delete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to delete message");
      }
  
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, deleted: 1, deletedAt: new Date().toISOString() } : msg
        )
      );      
  
      if (viewId === id) {
        setViewId(null);
      }
  
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };  

  const toggleStatus = async (id: number, currentStatus: "pending" | "reviewed") => {
    if (currentStatus !== "pending") return; 
  
    const token = getToken();
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "reviewed" }),
      });
  
      if (!res.ok) throw new Error("Failed to update status");
  
      setMessages(messages.map((msg) =>
        msg.id === id ? { ...msg, status: "reviewed" } : msg
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
    <div className="bg-black min-h-screen text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#D4AF37]">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 mb-6 border-b border-neutral-700">
        <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
              activeTab === "stats" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
            }`}
          >
            Stats
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "hero" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Hero
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "messages" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "media" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "availability" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Availability
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "services" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 font-semibold rounded-t flex-shrink-0 ${
            activeTab === "bookings" ? "bg-[#D4AF37] text-black" : "text-white hover:text-[#D4AF37]"
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Stats Tab */}
        {activeTab === "stats" && <DashboardStats/> }

        {/* Hero Tab */}
        {activeTab === "hero" && (
          <>
            <AdminHero hero={currentHero} />

            <div className="max-w-md mx-auto p-4 bg-[#1a1a1a] rounded mt-6">
              <h2 className="text-xl font-semibold text-[#D4AF37] mb-4">Admin Email Settings</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black/50 border border-neutral-700"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black/50 border border-neutral-700"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded ${
                    loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#D4AF37] text-black hover:opacity-90"
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Messages Tab */}
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
                {/* Mobile Messages */}
                <div className="sm:hidden space-y-4 mb-6">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-[#1a1a1a] p-4 rounded border border-neutral-800">
                        
                        <p className="text-sm text-neutral-400">ID</p>
                        <p className="mb-2">{msg.id}</p>

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

                            {msg.deleted !== 1 && (
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
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-neutral-800 mb-6">
                  <table className="min-w-full table-fixed border-collapse">
                    <thead className="bg-[#2c2c2c] text-white">
                      <tr>
                        <th className="py-3 px-4 text-left rounded-tl-lg">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
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
                        {/* Main Row */}
                        <tr className={idx % 2 === 0 ? "bg-black" : "bg-[#1a1a1a]"}>
                          <td className="py-2 px-4 truncate max-w-xs">{msg.id}</td>
                          <td className="py-2 px-4 truncate max-w-xs">{msg.name}</td>
                          <td className="py-2 px-4 truncate max-w-xs">{msg.email}</td>
                          <td className="py-2 px-4 truncate max-w-xs">{msg.phone || "-"}</td>
                          <td className="py-2 px-4 truncate max-w-xs">{msg.message}</td>
                          <td className="py-2 px-4 capitalize">{msg.status}</td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleString()}
                          </td>

                          <td className="py-2 px-4 text-center space-x-2">

                            {/* Only render this button if status is pending */}
                            {msg.status === "pending" && (
                              <button
                                onClick={() => toggleStatus(msg.id, msg.status)}
                                className="bg-[#D4AF37] text-black px-3 py-1 rounded"
                              >
                                Mark as Reviewed
                              </button>
                            )}

                            {msg.deleted !== 1 && (
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

                        {/* Expanded View Row */}
                        {viewId === msg.id && (
                          <tr className="bg-[#111]">
                            <td colSpan={8} className="p-6">
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
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <>
            {/* Upload Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full md:w-auto p-2 bg-neutral-900 text-white border border-neutral-700 rounded"
              />
              <button
                onClick={() => uploadFile && handleUpload(uploadFile)}
                className="bg-[#D4AF37] text-black px-4 py-2 rounded hover:opacity-90 transition"
              >
                Upload File
              </button>

              <input
                type="text"
                placeholder="Enter video URL"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="w-full md:w-auto p-2 bg-neutral-900 text-white border border-neutral-700 rounded"
              />
              <button
                onClick={async () => {
                  if (!videoUrlInput) return setUploadMessage("No URL provided");
                  const token = getToken();
                  if (!token) return setUploadMessage("Not authorized");

                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero-video`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ url: videoUrlInput, type: "video" }),
                    });
                    const data = await res.json();
                    setUploadMessage(data.message || "Video URL added successfully!");
                    fetchMedia();
                    setVideoUrlInput("");
                  } catch {
                    setUploadMessage("Failed to add video URL");
                  }
                }}
                className="bg-[#D4AF37] text-black px-4 py-2 rounded hover:opacity-90 transition"
              >
                Add Video URL
              </button>
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
                  <div
                    key={file.id}
                    className={`bg-[#1a1a1a] p-2 rounded relative border-2 ${
                      currentHero?.url === file.url ? "border-[#D4AF37]" : "border-transparent"
                    }`}
                  >
                    {file.file_type === "image" ? (
                      <img src={file.url} alt={file.original_name} className="w-full h-40 object-cover rounded" />
                    ) : (
                      <video src={file.url} controls className="w-full h-40 rounded" />
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
                          } catch {
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
                            const endpoint =
                              file.file_type === "image"
                                ? `${process.env.NEXT_PUBLIC_API_URL}/api/hero/image/latest`
                                : `${process.env.NEXT_PUBLIC_API_URL}/api/hero/video/latest`;

                            const res = await fetch(endpoint, {
                              method: "PATCH",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error("Failed to set hero");

                            setCurrentHero({ type: file.file_type, url: file.url });
                            alert("Hero updated successfully!");
                          } catch {
                            alert("Failed to set hero");
                          }
                        }}
                        className="bg-[#D4AF37] px-2 py-1 text-xs rounded hover:opacity-90"
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

        {/* Availability Tab */}
        {activeTab === "availability" && <AvailabilityPage/> }

        {/* Services Tab */}
        {activeTab === "services" && <AdminServices/> }

        {/* Bookings Tab */}
        {activeTab === "bookings" && <Bookings/> }
      </div>

      {/* Logout */}
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