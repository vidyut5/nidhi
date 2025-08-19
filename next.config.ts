import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Exclude API routes and admin routes from static export
  experimental: {
    // This will exclude API routes from the build
    excludeDefaultMomentLocales: true,
  },
  // Custom webpack config to exclude API routes
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude API routes from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
