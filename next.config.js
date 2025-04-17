/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.glbimg.com', 'res.cloudinary.com', 'localhost', 'logodetimes.com', 'api.dicebear.com'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }
};

module.exports = nextConfig; 