import Link from "next/link";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      {/* Contact Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-r from-[#1a1a1a] via-[#2b2b2b] to-[#3a2d1a]">
        <h1 className="text-5xl md:text-6xl font-bold text-[#D4AF37] mb-6">
          Contact
        </h1>
        <p className="max-w-2xl mx-auto text-white/80 text-lg">
        We'd love to hear from you! Whether you have questions, want a quote, or just want to say hello, reach out and we'll get back to you as soon as possible..
        </p>
      </section>

      {/* Contact Form Section */}
      <main className="bg-black text-white px-6 md:px-12 py-20">
        <section className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-semibold text-[#D4AF37]">
            Send Us a Message
          </h2>

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
        </section>
      </main>

            {/* Other Ways Section */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-r from-[#1a1a1a] via-[#2b2b2b] to-[#3a2d1a]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="mb-6 text-3xl md:text-4xl font-semibold text-[#D4AF37]">
            Other Ways to Get in Touch
          </h2>

          <div className="mt-16 grid md:grid-cols-2 gap-16 text-center">
            
            {/* Email */}
            <div className="space-y-3">
              <h3 className="uppercase tracking-widest text-sm text-white/60">
                Email
              </h3>
              <Link
                href="mailto:Madivisuals1@gmail.com"
                className="text-lg text-white hover:text-[#D4AF37] transition"
              >
                Madivisuals1@gmail.com
              </Link>
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <h3 className="uppercase tracking-widest text-sm text-white/60">
                Phone
              </h3>
              <Link
                href="tel:+1234567890"
                className="text-lg text-white hover:text-[#D4AF37] transition"
              >
                +1 (908) 392-1026
              </Link>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}