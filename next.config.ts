import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 
};

module.exports = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
      },
    ]
  }
}

export default nextConfig;
