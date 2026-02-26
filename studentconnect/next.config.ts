import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    // Ensure Turbopack uses this app folder as the root when multiple lockfiles exist.
    root: ".",
  },
  i18n: {
    defaultLocale: "en", // Standard lanuage
    locales: ["en", "it"], // Supporting language 
  },
};

export default nextConfig;