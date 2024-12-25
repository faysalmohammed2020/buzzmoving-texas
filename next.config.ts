import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["movingquotetexas.com", "via.placeholder.com"], // Add the external domain here
  },
};

module.exports = nextConfig;
