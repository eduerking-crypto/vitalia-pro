/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@vitalia/shared-types"],
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
