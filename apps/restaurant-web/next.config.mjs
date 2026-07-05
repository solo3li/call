import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv') || process.env.RUNNING_IN_DOCKER === 'true';
const backendUrl = isDocker ? 'http://backend:5109' : 'http://localhost:5109';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/orderHub/:path*',
        destination: `${backendUrl}/orderHub/:path*`,
      },
      {
        source: '/supportHub/:path*',
        destination: `${backendUrl}/supportHub/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
