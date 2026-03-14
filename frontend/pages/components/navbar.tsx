'use client';

import { SetStateAction, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BookingModal from "./bookOnline";

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
              <Link href="https://madivisuals27.pixieset.com/sampleshots/" className="text-sm font-medium text-white transition hover:text-[#D4AF37]">
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
          <BookingModal open={open} setOpen={setOpen} />
        </div>
      </nav>
    </header>
  );
}