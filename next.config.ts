import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets several dev servers run side by side from one checkout.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The 3D design previews were reviewed at /v1-/v4; /v4 is now the home page.
  async redirects() {
    return ["/v1", "/v2", "/v3", "/v4"].map((source) => ({
      source,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
