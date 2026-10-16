import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable Next.js dev indicator badge (bundler, cache components overlay) */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
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
