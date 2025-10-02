const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Use repository root as outputFileTracingRoot to avoid lockfile warnings
  outputFileTracingRoot: path.join(__dirname, '..'),
  eslint: {
    // Allow production builds to complete even if ESLint finds issues
    ignoreDuringBuilds: true,
  },
};
