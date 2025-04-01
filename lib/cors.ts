import { NextResponse } from 'next/server';

// CORS 配置
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS 响应处理函数
export function corsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { 
    status,
    headers: corsHeaders 
  });
}

// OPTIONS 预检请求处理函数
export function corsOptionsResponse() {
  return NextResponse.json({}, { headers: corsHeaders });
} 