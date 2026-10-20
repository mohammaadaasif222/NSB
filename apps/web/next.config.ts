import path from "node:path";
import type { NextConfig } from "next";

const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000/api";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  // Trace from the monorepo root so @nsb/shared is included in the standalone output.
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  images: {
    remotePatterns: [
      // Admin-uploaded images, by storage provider (Admin > Settings). Local uploads are /api/uploads/ paths.
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
      // YouTube thumbnails for listing videos and Shorts.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Demo listing photos (npm run db:seed:demo).
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // In development the browser calls /api on the Next.js origin and is proxied to NestJS,
  // so the session cookie stays first-party. In production Caddy routes /api/* to the API first.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
