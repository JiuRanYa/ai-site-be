import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 允许的域名列表
const allowedOrigins = [
  'http://localhost:3000',
  'https://nexus.skin',
  'https://ai-site-be.vercel.app'
];

// 中间件函数
export function middleware(request: NextRequest) {
  // 获取请求的源
  const origin = request.headers.get('origin');

  // 检查是否是允许的源
  if (origin && allowedOrigins.includes(origin)) {
    // 创建响应
    const response = NextResponse.next();

    // 添加 CORS 头
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    return response;
  }

  return NextResponse.next();
}

// 配置中间件要处理的路径
export const config = {
  matcher: [
    // 应用到所有 API 路由
    '/api/:path*',
  ],
}; 