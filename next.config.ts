import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets several dev servers run side by side from one checkout.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
