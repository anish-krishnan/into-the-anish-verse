import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/*": [
      "./public/fonts/**/*",
      "./public/anish-sample.jpg",
      "./public/partiful-cover.png",
    ],
  },
};

export default nextConfig;
