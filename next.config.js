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
  },
  async headers() {
    return [
        {
            // matching all API routes
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
            ]
        }
    ]
}
};

module.exports = nextConfig; 