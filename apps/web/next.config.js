/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const isStandalone = process.env.BUILD_STANDALONE === "true";
const basePath = process.env.STATIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // "export"  → sitio estático (GitHub Pages / APK con Capacitor)
  // "standalone" → imagen Docker (BUILD_STANDALONE=true)
  // undefined → build normal (`next start`, Vercel)
  output: isStaticExport ? "export" : isStandalone ? "standalone" : undefined,
  trailingSlash: isStaticExport,
  basePath: isStaticExport ? basePath : "",
  transpilePackages: ["@vitalia/shared-types"],
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [],
  },
};

module.exports = nextConfig;
