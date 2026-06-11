import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nkmneyqkztlogibyecsz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Allow any supabase project URL pattern
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
