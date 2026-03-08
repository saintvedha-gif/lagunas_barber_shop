import type { NextConfig } from "next";

// En producción (Render): mismo host → las imágenes llegan vía rewrite,
// no son URLs remotas. En desarrollo sí son http://localhost:4000/...
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  experimental:{
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dv7mmbuew/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy al backend — activo en prod cuando NEXT_PUBLIC_API_URL=""
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
