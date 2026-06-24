import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.173.131.145'],

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