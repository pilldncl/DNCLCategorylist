/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable CSS optimization
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: ['react-window'],

  },

  // Transpile packages for better compatibility
  transpilePackages: ['@supabase/supabase-js'],

  // Image optimization
  images: {
    // Enable image optimization
    unoptimized: false,
    // Configure remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'buy.gazelle.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gazelle.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.gazelle.com',
        port: '',
        pathname: '/**',
      },
      // Allow any HTTPS image for dynamic image management
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    // Configure image formats
    formats: ['image/webp', 'image/avif'],
    // Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,



  // Configure headers for better caching
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Static assets caching
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes caching
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
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
    }

    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            fallback: 'file-loader',
            publicPath: '/_next/static/images/',
            outputPath: 'static/images/',
          },
        },
      ],
    });

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Base path (if needed)
  // basePath: '',

  // Asset prefix (if needed)
  // assetPrefix: '',

  // Trailing slash
  trailingSlash: false,

  // Enable React strict mode
  reactStrictMode: true,

  // Enable TypeScript checking
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Enable ESLint checking
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
