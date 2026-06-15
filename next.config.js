const withPWAInit = require('@ducanh2912/next-pwa').default

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    // Served when a navigation request fails and isn't in the cache.
    document: '/offline',
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Flipped to false in BLOCK E once ESLint config is in place.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  async redirects() {
    return [
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
    ]
  },
}

module.exports = withPWA(nextConfig)
