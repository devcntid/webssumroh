import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
  serverExternalPackages: ["@neondatabase/serverless", "sharp"],
};

export default nextConfig;
