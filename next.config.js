/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    // Allow external image domains for existing images
    remotePatterns: [
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
        hostname: 'images.unsplash.com',
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
        hostname: 'i5.walmartimages.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'comptechdirect.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image-us.samsung.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'target.scene7.com',
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
        hostname: 'www.backmarket.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'reebelo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's7d1.scene7.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
