import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.tgdd.vn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
   

// next.config.js
module.exports = {
  images: {
    domains: ['www.watchstore.vn'],
  },
}
