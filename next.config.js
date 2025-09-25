/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_BACKEND_BASE: process.env.NEXT_PUBLIC_BACKEND_BASE,
  },
  async rewrites() {
    // Only add rewrites if backend URL is configured
    if (process.env.NEXT_PUBLIC_BACKEND_BASE) {
      return [
        {
          source: '/api/backend/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/:path*`,
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig
