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
  serverExternalPackages: ["@neondatabase/serverless", "isomorphic-dompurify"],
};

export default nextConfig;
