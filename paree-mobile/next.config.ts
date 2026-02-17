import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable server-side image optimization since we are exporting statically
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
