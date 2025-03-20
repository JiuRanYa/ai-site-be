/**
 * 应用配置
 * 从环境变量中读取配置，提供默认值
 */

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // 认证配置
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  
  // API 配置
  api: {
    url: process.env.API_URL || 'http://localhost:3000/api',
    publicUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  
  // 其他外部服务配置
  services: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    siliconFlow: {
      apiKey: process.env.SILICON_FLOW_API_KEY || '',
      baseUrl: 'https://api.siliconflow.cn/v1',
    },
  },
};

export default config; 