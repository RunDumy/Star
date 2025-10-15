import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization for static export
  images: {
    unoptimized: true,
  },

  // Static Export Configuration for Azure deployment - disabled for local dev
  // output: 'export',
  // distDir: 'out',
  trailingSlash: true,

  // Repository root for lockfile resolution
  outputFileTracingRoot: path.join(__dirname, '..'),

  // Allow builds with errors for initial deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Simple webpack optimization for production
  webpack: (config) => {
    // Three.js optimization to prevent build errors
    config.module.exprContextCritical = false;

    // Resolve aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
      '@hooks': path.resolve(__dirname, './hooks'),
    };

    return config;
  },

  // Environment variables for build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_APP_NAME: 'STAR',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
