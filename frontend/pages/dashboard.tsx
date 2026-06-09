'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHero from "./admin-hero";
import React from "react";
import AvailabilityPage from "./availability";
import AdminServices from "./admin-services";
import Bookings from "./components/bookings";
import DashboardStats from "./components/dashboard-stats";
import Uploads from "./components/uploads";
import Contact from "./components/contacts";


export default function Dashboard() {
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

  useEffect(() => {
    fetchCurrentHero();
    fetchEmail();
  }, []);

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
        {activeTab === "hero" && <AdminHero/>}

        {/* Messages Tab */}
        {activeTab === "messages" && <Contact/> }

        {/* Media Tab */}
        {activeTab === "media" && <Uploads/> }

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