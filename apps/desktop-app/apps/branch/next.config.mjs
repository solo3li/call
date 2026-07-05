import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv') || process.env.RUNNING_IN_DOCKER === 'true';
const backendUrl = isDocker ? 'http://backend:5109' : 'http://localhost:5109';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isDocker ? undefined : 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
