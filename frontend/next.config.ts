import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['madi-visuals-server.onrender.com', 'res.cloudinary.com'], // allow your backend host
  },
  reactStrictMode: false,
};

export default nextConfig;
