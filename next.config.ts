import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/*": [
      "./public/fonts/**/*",
      "./public/assets/**/*",
    ],
  },
};

export default nextConfig;
