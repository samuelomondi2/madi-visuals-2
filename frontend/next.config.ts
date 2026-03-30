import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['madi-visuals-2.onrender.com', 'res.cloudinary.com'], // allow your backend host
  },
  reactStrictMode: false,
};

export default nextConfig;
