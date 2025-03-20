import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 中间件函数
export function middleware(request: NextRequest) {
  // 获取请求路径和方法
  const path = request.nextUrl.pathname;
  const method = request.method;
  
  // 记录 API 请求
  if (path.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  }
  
  // 设置响应头
  const response = NextResponse.next();
  response.headers.set('X-API-Version', '1.0.0');
  response.headers.set('X-Powered-By', 'Next.js');
  
  return response;
}

// 配置中间件要处理的路径
export const config = {
  matcher: [
    // 应用到所有 API 路由
    '/api/:path*',
  ],
}; 