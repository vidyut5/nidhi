import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{member}}",
      preventFullImport: true,
    },
  },
  experimental: {
    optimizePackageImports: ["@tanstack/react-query", "framer-motion"],
  },
  transpilePackages: [
    "uploadthing",
    "@uploadthing/react",
    "@uploadthing/shared",
    "@effect/platform",
    "effect",
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Ensure all imports of "effect" resolve to the top-level package
      effect: path.dirname(require.resolve("effect/package.json")),
    }
    return config
  },
};

export default nextConfig;
