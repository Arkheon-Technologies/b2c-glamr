import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages (raw TypeScript)
  transpilePackages: ["@glamr/shared-types"],
};

export default nextConfig;
