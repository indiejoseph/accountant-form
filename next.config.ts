import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Since we're using Biome
  },
  transpilePackages: ["@mantine/core", "@mantine/hooks", "@mantine/form"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
