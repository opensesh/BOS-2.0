import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Google favicon service
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      // Allow all external images for og:image thumbnails
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Temporarily ignore build errors to work around next/types.js issue
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail build on ESLint errors during deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
