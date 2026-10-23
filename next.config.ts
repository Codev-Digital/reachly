import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid React Strict Mode double-mounting effects (duplicate API calls in dev)
  reactStrictMode: false,
  allowedDevOrigins: ['10.173.131.145'],

  async redirects() {
    return [
      {
        source: '/creators/bookings',
        destination: '/creators/calendar',
        permanent: false,
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nkmneyqkztlogibyecsz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;