import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin app root so a stray lockfile in a parent folder cannot break route discovery.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ssumroh.id" },
      { protocol: "https", hostname: "cna.co.id" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "hamisbooking.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/halal-tour", destination: "/", permanent: true },
      { source: "/halal-tour/:path*", destination: "/", permanent: true },
      { source: "/wisata-halal", destination: "/", permanent: true },
      { source: "/wisata-halal/:path*", destination: "/", permanent: true },
      // Keep admin OAuth on the live custom domain (cookie + NEXTAUTH_URL must match).
      {
        source: "/panel",
        has: [{ type: "host", value: "webssumroh.vercel.app" }],
        destination: "https://ssumroh.id/panel",
        permanent: false,
      },
      {
        source: "/panel/:path*",
        has: [{ type: "host", value: "webssumroh.vercel.app" }],
        destination: "https://ssumroh.id/panel/:path*",
        permanent: false,
      },
      {
        source: "/api/auth/:path*",
        has: [{ type: "host", value: "webssumroh.vercel.app" }],
        destination: "https://ssumroh.id/api/auth/:path*",
        permanent: false,
      },
    ];
  },
  serverExternalPackages: ["@neondatabase/serverless", "sharp"],
};

export default nextConfig;
