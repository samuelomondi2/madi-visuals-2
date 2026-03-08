'use client';

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id?: string) => {
    if (!id) return; 
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const links = [
    { label: "About", id: "about" },
    { label: "Services & Pricing", id: "services" },
    { label: "Portfolio", href: "https://madivisuals27.pixieset.com/sampleshots/" }, 
    { label: "FAQ & Policies", id: "faq" },
    { label: "Contact", id: "contact" },
    { label: "Book Now", id: "appointment" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Madi Visuals Logo" width={44} height={44} />
          <span className="text-lg font-semibold text-white tracking-wide">
            MADI <span className="font-light text-[#D4AF37]">VISUALS</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) =>
            link.href ? (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white transition hover:text-[#D4AF37]"
                >
                  {link.label}
                </a>
              </li>
            ) : (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm font-medium text-white transition hover:text-[#D4AF37]"
                >
                  {link.label}
                </button>
              </li>
            )
          )}
        </ul>

        {/* Desktop CTA */}
        <button
          onClick={() => scrollToSection("appointment")}
          className="hidden md:block rounded-lg border border-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
        >
          Book Now
        </button>

        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button onClick={() => setOpen(!open)} className="rounded-lg border border-neutral-700 p-2 text-[#D4AF37]">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-4 w-48 space-y-3 rounded-xl border border-neutral-800 bg-black p-4">
              {links.map((link) =>
                link.href ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]"
                  >
                    {link.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}