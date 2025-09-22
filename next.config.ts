import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    domains: ["movingquotetexas.com", "via.placeholder.com"],
  },
  async rewrites() {
    return [
      {
        source: '/api/moving/:path*',
        destination: 'https://movingrelogroup.org/:path*',
      },
    ];
  },
};

export default nextConfig;
