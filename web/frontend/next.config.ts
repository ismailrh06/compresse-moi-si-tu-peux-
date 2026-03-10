import type { NextConfig } from "next";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_BASE_URL) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/:path*`
      }
    ];
  },
};

export default nextConfig;

