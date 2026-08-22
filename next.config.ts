import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["groq-sdk"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;