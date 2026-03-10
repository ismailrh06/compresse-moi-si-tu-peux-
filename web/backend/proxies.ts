import type { NextConfig } from "next";

export const proxies: NextConfig["rewrites"] = async () => {
  return {
    beforeFiles: [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ],
    afterFiles: [],
    fallback: [],
  };
};
