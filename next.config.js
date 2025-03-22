/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  compress: true,
  async redirects() {
    return [
      {
        source: '/instagram',
        destination: '/dashboard/products?platform=instagram',
        permanent: true,
      },
      {
        source: '/tiktok',
        destination: '/dashboard/products?platform=tiktok',
        permanent: true,
      },
      {
        source: '/takipci',
        destination: '/dashboard/products?platform=instagram&subcategory=followers',
        permanent: true,
      },
      {
        source: '/begeni',
        destination: '/dashboard/products?platform=instagram&subcategory=likes',
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  experimental: {
    largePageDataBytes: 128 * 1000,
  },
}

module.exports = nextConfig 