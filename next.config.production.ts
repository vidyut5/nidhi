import type { NextConfig } from "next";

/**
 * Production-specific Next.js configuration
 * This configuration is optimized for production deployment
 * with full SSR, API routes, and dynamic features enabled
 */

const productionConfig: NextConfig = {
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Output configuration for production
  output: 'standalone', // Optimized for Docker/containerized deployments
  
  // Image optimization for production
  images: {
    unoptimized: false, // Enable Next.js image optimization
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'res.cloudinary.com',
      'uploadthing.com',
      'cdn.vidyut.com', // Your CDN domain
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    quality: 85,
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Experimental features for production
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'framer-motion'
    ],
    // Enable app directory features
    appDir: true,
    // Server components logging
    serverComponentsExternalPackages: ['@prisma/client'],
    // Turbopack for faster builds (when stable)
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // Custom webpack configuration for production
  webpack: (config: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
    // Production optimizations
    if (!dev) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
      
      // Minimize bundle size
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // Handle SVG files
    config.module.rules.push({\n      test: /\\.svg$/,\n      use: ['@svgr/webpack'],\n    });\n    \n    // Handle markdown files\n    config.module.rules.push({\n      test: /\\.(md|mdx)$/,\n      use: 'raw-loader',\n    });\n    \n    // Analyze bundle if requested\n    if (process.env.ANALYZE === 'true') {\n      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');\n      config.plugins.push(\n        new BundleAnalyzerPlugin({\n          analyzerMode: 'static',\n          openAnalyzer: false,\n          reportFilename: '../bundle-analyzer-report.html',\n        })\n      );\n    }\n    \n    return config;\n  },\n  \n  // Security headers for production\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [\n          {\n            key: 'X-Frame-Options',\n            value: 'DENY',\n          },\n          {\n            key: 'X-Content-Type-Options',\n            value: 'nosniff',\n          },\n          {\n            key: 'X-XSS-Protection',\n            value: '1; mode=block',\n          },\n          {\n            key: 'Referrer-Policy',\n            value: 'strict-origin-when-cross-origin',\n          },\n          {\n            key: 'Permissions-Policy',\n            value: 'geolocation=(self), microphone=(), camera=(), fullscreen=(self), payment=(self)'\n          },\n          {\n            key: 'Strict-Transport-Security',\n            value: 'max-age=31536000; includeSubDomains; preload',\n          },\n          {\n            key: 'Content-Security-Policy',\n            value: [\n              \"default-src 'self'\",\n              \"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com\",\n              \"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com\",\n              \"font-src 'self' https://fonts.gstatic.com\",\n              \"img-src 'self' data: https: blob:\",\n              \"media-src 'self' data: https:\",\n              \"connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google-analytics.com\",\n              \"frame-src 'self' https://checkout.razorpay.com\",\n              \"object-src 'none'\",\n              \"base-uri 'self'\",\n              \"form-action 'self'\"\n            ].join('; ')\n          },\n        ],\n      },\n      {\n        // API routes - no caching\n        source: '/api/(.*)',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',\n          },\n        ],\n      },\n      {\n        // Static assets - aggressive caching\n        source: '/_next/static/(.*)',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'public, max-age=31536000, immutable',\n          },\n        ],\n      },\n      {\n        // Images - moderate caching\n        source: '/(.*\\.(png|jpg|jpeg|gif|webp|svg|ico))',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'public, max-age=86400, stale-while-revalidate=604800',\n          },\n        ],\n      },\n    ];\n  },\n  \n  // Production redirects\n  async redirects() {\n    return [\n      {\n        source: '/admin',\n        destination: '/admin/login',\n        permanent: false,\n      },\n      {\n        source: '/dashboard',\n        destination: '/sell/dashboard',\n        permanent: false,\n      },\n      {\n        source: '/seller/:slug',\n        destination: '/seller/:slug/products',\n        permanent: false,\n      },\n      // SEO redirects\n      {\n        source: '/product/:id/buy',\n        destination: '/product/:id',\n        permanent: true,\n      },\n    ];\n  },\n  \n  // URL rewrites for clean URLs and API endpoints\n  async rewrites() {\n    return {\n      beforeFiles: [\n        {\n          source: '/sitemap.xml',\n          destination: '/api/sitemap',\n        },\n        {\n          source: '/robots.txt',\n          destination: '/api/robots',\n        },\n        {\n          source: '/manifest.json',\n          destination: '/api/manifest',\n        },\n      ],\n      afterFiles: [\n        // Fallback rewrites\n        {\n          source: '/products/:path*',\n          destination: '/category/:path*',\n        },\n      ],\n    };\n  },\n  \n  // Environment variables exposed to client\n  env: {\n    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',\n    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),\n    NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',\n  },\n  \n  // Production build settings\n  eslint: {\n    dirs: ['app', 'components', 'lib', 'hooks', 'types'],\n    ignoreDuringBuilds: false, // Strict in production\n  },\n  \n  typescript: {\n    ignoreBuildErrors: false, // Strict in production\n  },\n  \n  // Logging configuration\n  logging: {\n    fetches: {\n      fullUrl: false, // Don't log full URLs in production\n    },\n  },\n  \n  // Generate source maps for production debugging\n  productionBrowserSourceMaps: true,\n  \n  // Optimize font loading\n  optimizeFonts: true,\n  \n  // Modern JavaScript target\n  compiler: {\n    removeConsole: {\n      exclude: ['error', 'warn'], // Keep error and warn logs\n    },\n  },\n};\n\nexport default productionConfig;