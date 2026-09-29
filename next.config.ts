import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  images: {
    // Serve resized AVIF/WebP instead of the raw PNGs (the Gemini-Supermemory
    // screenshot alone is ~7 MB).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
