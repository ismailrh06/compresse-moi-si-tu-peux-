import type { NextConfig } from "next";

const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const allowedDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.7:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

