// ./app/contact/page.tsx
import Link from "next/link";
import Image from "next/image";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-black text-white pt-24 px-6 md:px-12">
        <section className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-[#D4AF37]">Contact Us</h1>
          <p className="mb-8 text-lg text-white/80">
            We'd love to hear from you! Whether you have questions, want a quote, or just want to say hello, reach out and we'll get back to you as soon as possible.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name"
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2 text-white placeholder-white/50 focus:border-[#D4AF37] focus:outline-none"
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
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2 text-white placeholder-white/50 focus:border-[#D4AF37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Your message..."
                className="w-full rounded-md border border-neutral-700 bg-black/50 px-4 py-2 text-white placeholder-white/50 focus:border-[#D4AF37] focus:outline-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              Send Message
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-semibold text-[#D4AF37]">Other Ways to Reach Us</h2>
            <p>Email: <Link href="mailto:info@madivisuals.com" className="text-white/80 hover:text-[#D4AF37]">info@madivisuals.com</Link></p>
            <p>Phone: <Link href="tel:+1234567890" className="text-white/80 hover:text-[#D4AF37]">+1 (234) 567-890</Link></p>
          </div>
        </section>
        <Footer/>
      </main>
    </>
  );
}