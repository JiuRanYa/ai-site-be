/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 配置开发服务器端口
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devServer = {
        port: 3001,
        host: '0.0.0.0'
      };
    }
    return config;
  }
};

module.exports = nextConfig; 