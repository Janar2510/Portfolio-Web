const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@portfolio/shared'],
  experimental: {
    serverActions: true,
  },
};

module.exports = withNextIntl(nextConfig);
