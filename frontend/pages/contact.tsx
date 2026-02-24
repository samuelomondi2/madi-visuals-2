"use client";

import Link from "next/link";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Phone validation (simple US format)
  const isValidPhone = (phone: string) =>
    /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/.test(phone);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        "https://madi-visuals-2.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phone, email, message }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      toast.success("Message sent successfully!");

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-black text-white px-6 md:px-12 py-20">
        <section className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-semibold text-[#D4AF37]">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
              required
            />

            <input
              type="tel"
              placeholder="xxx-xxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
              required
            />

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
              required
            />

            <textarea
              rows={5}
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg px-5 py-3 text-sm font-medium transition flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#D4AF37] text-black hover:opacity-90"
                }`}
            >
              {isLoading && (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              )}
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}