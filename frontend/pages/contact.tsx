"use client";

import Link from "next/link";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "https://madi-visuals-2.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            message,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      setSuccess("Message sent successfully!");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      {/* Contact Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-r from-[#1a1a1a] via-[#2b2b2b] to-[#3a2d1a]">
        <h1 className="text-5xl md:text-6xl font-bold text-[#D4AF37] mb-6">
          Contact
        </h1>
        <p className="max-w-2xl mx-auto text-white/80 text-lg">
          We'd love to hear from you! Whether you have questions, want a quote,
          or just want to say hello.
        </p>
      </section>

      {/* Contact Form Section */}
      <main className="bg-black text-white px-6 md:px-12 py-20">
        <section className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-semibold text-[#D4AF37]">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {success && (
              <p className="text-green-500 text-sm">{success}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}