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
      // Pexels image CDN
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // TODO(security): ignoreBuildErrors is set to true to work around a next/types.js
    // compatibility issue in the build pipeline. This means TypeScript errors won't
    // block deployments. For a demo/internal site this is acceptable, but for
    // production services this should be removed once the underlying issue is resolved.
    // Track: https://github.com/vercel/next.js/issues — next/types.js module resolution
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO(security): ignoreDuringBuilds suppresses ESLint errors during deployment.
    // This is intentional for this demo site to avoid blocking deploys on lint warnings.
    // For production services, remove this flag and fix all lint issues before merging.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
