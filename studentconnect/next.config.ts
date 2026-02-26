import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    // Ensure Turbopack uses this app folder as the root when multiple lockfiles exist.
    root: ".",
  },
};

export default nextConfig;
