import type { NextConfig } from "next";
import path from "path";

const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repoName = 'vidyut1'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // For static export / GitHub Pages
    unoptimized: isGithubPages,
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
  // Static export for GitHub Pages
  ...(isGithubPages ? { output: 'export' as const, basePath: `/${repoName}`, assetPrefix: `/${repoName}/` } : {}),
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
