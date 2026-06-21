/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@finance-app/core',
    '@finance-app/types',
    '@finance-app/ui',
    '@react-three/fiber',
    '@react-three/drei',
    'three',
  ],
};

export default nextConfig;
