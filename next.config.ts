import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Babel for compilation instead of Rust SWC bindings on Windows to avoid module crash.
  experimental: {
    forceSwcTransforms: true, // This is sometimes used, but another fix is serverComponentsExternalPackages
  },
};

export default nextConfig;
