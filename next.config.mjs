/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'canvas-confetti'],
  },
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
    ],
  },
};

export default nextConfig;
