import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['your-image-cdn.com'],
  },
  // Set outputFileTracingRoot to the repository root so Next can correctly
  // compute the project root when multiple lockfiles are present.
  outputFileTracingRoot: path.join(__dirname, '..'),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // For Three.js and large dependencies
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };

    // Handle Three.js modules
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  }
};

export default nextConfig;
