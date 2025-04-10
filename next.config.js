/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['s.glbimg.com', 'res.cloudinary.com', 'localhost', 'logodetimes.com'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  experimental: {
    serverComponents: true,
  },
};

module.exports = nextConfig; 