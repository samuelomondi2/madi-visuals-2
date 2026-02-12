import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#F2F1EE] text-neutral-700">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="mx-auto">
              <Image
                src="/logo.png"
                alt="Madi Visuals Logo"
                width={150}
                height={44}
                priority
                className="object-contain transition hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              Cinematic photography & videography capturing timeless moments
              with intention and elegance.
            </p>
        </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-black">
              Explore
            </h4>
            <ul className="mt-6 space-y-4 text-sm">
              <li><Link href="/" className="hover:text-black">Home</Link></li>
              <li><Link href="/services" className="hover:text-black">Services & Pricing</Link></li>
              <li><Link href="/portfolio" className="hover:text-black">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-black">
              Social Media
            </h4>
            <ul className="mt-6 space-y-4 text-sm">
              <li><a href="https://www.instagram.com/madivisuals_/" className="hover:text-black">Instagram</a></li>
              <li><a href="https://www.twitter.com/@madivisuals_" className="hover:text-black">Twitter</a></li>
              <li><a href="https://www.tiktok.com/@madivisuals_" className="hover:text-black">TikTok</a></li>
            </ul>
          </div>

          {/* Others */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-black">
              Others
            </h4>
            <ul className="mt-6 space-y-4 text-sm">
              <li><Link href="/faq" className="hover:text-black">FAQ</Link></li>
              <li><Link href="/policies" className="hover:text-black">Policies</Link></li>
              <li><Link href="/licensing" className="hover:text-black">Licensing</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 h-px w-full bg-neutral-300" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <span>
            © {new Date().getFullYear()} Madi Visuals. All rights reserved.
          </span>
          {/* <span>
            Crafted with care.
          </span> */}
        </div>
      </div>
    </footer>
  );
}