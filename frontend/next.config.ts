import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// `next dev` also serves the LAN address it prints (http://172.x.x.x:3000);
// allow this machine's own IPs so HMR and dev assets work from there too.
const lanHosts = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: lanHosts,
  poweredByHeader: false,
  output: "standalone",
  compress: true,
  images: {
    // product images are served by the Go API (local uploads); keep them unoptimized
    unoptimized: true,
  },
  // Without nginx in front (dev), proxy the API through Next so the browser stays
  // same-origin: no CORS, no Local Network Access prompt, works from phones too.
  async rewrites() {
    const api = process.env.API_URL || "http://localhost:8080";
    return [
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
