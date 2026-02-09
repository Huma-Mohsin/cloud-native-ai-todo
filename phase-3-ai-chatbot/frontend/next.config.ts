import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/backend-api/api/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:8002'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
