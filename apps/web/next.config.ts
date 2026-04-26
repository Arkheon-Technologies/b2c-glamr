import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages (raw TypeScript)
  transpilePackages: ["@glamr/shared-types", "@glamr/ui"],

  // ─── Performance ───────────────────────────────────────────────────
  // Optimise imports from these heavy packages — tree-shake icons, utils, etc.
  experimental: {
    optimizePackageImports: ["lucide-react", "@glamr/ui"],
  },

  // Image optimisation — allow external image hosts
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // S3 / CloudFront for uploaded portfolio / avatar images
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      // Local dev MinIO
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },

  // ─── Headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      // Long-lived caching for static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/studio/calendar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
