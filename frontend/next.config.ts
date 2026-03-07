import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.render.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
