/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${backend.replace(/\/$/, '')}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
