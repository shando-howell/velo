import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 
};

module.exports = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acrobatic-lobster-641.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ]
  }
}

export default nextConfig;
