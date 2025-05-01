/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      's.glbimg.com',
      'localhost',
      'logodetimes.com',
      'api.dicebear.com',
      'img.a.transfermarkt.technology',
      'localhost:3000'
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/album-brasileirao-2025' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/album-brasileirao-2025' : '',
};

module.exports = nextConfig; 