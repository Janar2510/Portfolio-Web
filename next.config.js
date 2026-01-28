const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@portfolio/shared',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '**',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
