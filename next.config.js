/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      's.glbimg.com',
      'res.cloudinary.com',
      'localhost',
      'logodetimes.com',
      'api.dicebear.com',
      'img.a.transfermarkt.technology',
      'www.escudosfc.com.br',
      'www.escudosfc.com',
      'escudosfc.com.br',
      'escudosfc.com'
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
};

module.exports = nextConfig; 