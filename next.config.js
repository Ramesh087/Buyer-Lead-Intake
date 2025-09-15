/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true, // Optional: ignore lint errors in build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // allow images from any host (adjust for production)
      },
    ],
  },
}

module.exports = nextConfig
