const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  // Configuration des images optimisée
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimisations des performances
  compiler: {
    // Réduire la taille du JavaScript en production
    // removeConsole: process.env.NODE_ENV === 'production',
  },
  // Options expérimentales compatibles avec Next.js 15
  experimental: {
    // Optimisation du chargement des pages
    optimizeServerReact: true,
    // Restauration du défilement de page
    scrollRestoration: true,
  },
};

module.exports = nextConfig;