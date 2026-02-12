'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Madi Visuals Logo"
            width={44}
            height={44}
            priority
            className="object-contain"
          />
          <span className="text-lg font-semibold text-white tracking-wide">
            MADI <span className="font-light text-[#D4AF37]">VISUALS</span>
          </span>
      </Link>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <Link href="/about" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">About</Link>
            </li>

            <li>
              <Link href="/services" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">
                Services & Pricing
              </Link>
            </li>

            <li>
              <Link href="/portfolio" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">
                Portfolio
              </Link>
            </li>

            <li>
              <Link href="/faq" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">FAQ & Policies</Link>
            </li>

            <li>
              <Link href="/contact" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">Contact Us</Link>
            </li>
          </ul>

          {/* Desktop CTA */}
          <Link
            href="/appointment"
            className="hidden md:block rounded-lg border border-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            Book Now
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-lg border border-neutral-700 p-2 text-[#D4AF37]"
            aria-label="Toggle Menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="mt-4 space-y-3 rounded-xl border border-neutral-800 bg-black p-4 md:hidden">
            <Link href="/about" className="block rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]" onClick={() => setOpen(false)}>
              About
            </Link>

            <Link href="/services" className="block rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]" onClick={() => setOpen(false)}>
              Services & Pricing
            </Link>

            <Link href="/portfolio" className="block rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]" onClick={() => setOpen(false)}>
              Portfolio
            </Link>

            <Link href="/faq" className="block rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]" onClick={() => setOpen(false)}>
              FAQ & Policies
            </Link>

            <Link href="/contact" className="block rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 hover:text-[#D4AF37]" onClick={() => setOpen(false)}>
              Contact Us
            </Link>

            <Link
              href="/appointment"
              className="block rounded-lg bg-[#D4AF37] px-4 py-2 text-center text-sm font-medium text-black hover:opacity-90"
              onClick={() => setOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}