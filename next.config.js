/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry', '@ant-design/cssinjs'],
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

module.exports = nextConfig;
