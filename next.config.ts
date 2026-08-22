import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - mengabaikan peringatan tipe eslint untuk Next.js 15+
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;