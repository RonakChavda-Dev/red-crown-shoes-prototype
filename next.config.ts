import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site in /out, served as-is by Cloudflare Pages (or any static host).
  output: "export",
  images: {
    // No image server on a static host; the renders are already sized WebP.
    unoptimized: true,
    // Shoe renders carry a ?v= cache-busting version.
    localPatterns: [{ pathname: "/images/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
