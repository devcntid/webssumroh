import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ssumroh.id" },
      { protocol: "https", hostname: "cna.co.id" },
    ],
  },
  serverExternalPackages: ["@neondatabase/serverless", "isomorphic-dompurify"],
};

export default nextConfig;
