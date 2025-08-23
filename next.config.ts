import type { NextConfig } from "next";

// Production-ready Next.js configuration
const nextConfig: NextConfig = {
  // Remove static export for production (enables API routes, SSR, etc.)
  // output: 'export', // Only enable for static hosting like GitHub Pages
  
  // Enable experimental features for better performance
  experimental: {
    // Enable partial prerendering for better performance
    ppr: false, // Set to true when stable
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      'lucide-react'
    ],
    // Enable typed routes for better DX
    typedRoutes: true,
  },
  
  // Image optimization for production
  images: {
    // Enable optimization for production
    unoptimized: false,
    // Image domains for external images
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'res.cloudinary.com',
      'uploadthing.com'
    ],
    // Image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression and optimization
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // Trailing slash handling
  trailingSlash: false,
  
  // Bundle analyzer (enable when needed)
  // Enable with: ANALYZE=true npm run build
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: true,
        })
      );
      return config;
    },
  }),
  
  // Custom webpack configuration
  webpack: (config: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      // Replace React with Preact in production (smaller bundle)
      // Uncomment if you want smaller bundle size
      // Object.assign(config.resolve.alias, {
      //   'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
      //   react: 'preact/compat',
      //   'react-dom/test-utils': 'preact/test-utils',
      //   'react-dom': 'preact/compat',
      // });
    }
    
    // Add custom loader for specific file types
    config.module.rules.push({
      test: /\.(md|mdx)$/,
      use: 'raw-loader',
    });
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/login',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/sell/dashboard',
        permanent: false,
      },
    ];
  },
  
  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  
  // Environment variables for client
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  
  // ESLint configuration
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['app', 'components', 'lib', 'hooks'],
    // Don't fail build on ESLint errors in production
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript configuration
  typescript: {
    // Don't fail build on TypeScript errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Output configuration
  output: process.env.NEXT_OUTPUT || 'standalone',
  
  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
