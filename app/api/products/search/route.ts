import { NextRequest } from "next/server";
import { sql, ilike, or } from "drizzle-orm";
import db from "@/db";
import { products } from "@/db/schema";
import { corsResponse, corsOptionsResponse } from "@/lib/cors";

// OPTIONS 预检请求处理
export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 验证分页参数
    if (page < 1 || pageSize < 1) {
      return corsResponse({ 
        error: '页码和每页数量必须大于0' 
      }, 400);
    }

    const offset = (page - 1) * pageSize;
    const dbInstance = await db;

    // 构建搜索条件
    const searchCondition = or(
      ilike(products.title, `%${query}%`),
      ilike(products.description, `%${query}%`),
      sql`${products.tags}::text ILIKE ${`%${query}%`}`
    );

    // 获取总记录数
    const [{ count }] = await dbInstance
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(searchCondition) as [{ count: number }];

    // 获取分页数据
    const items = await dbInstance
      .select()
      .from(products)
      .where(searchCondition)
      .orderBy(products.createdAt)
      .limit(pageSize)
      .offset(offset);

    // 计算总页数
    const totalPages = Math.ceil(count / pageSize);

    return corsResponse({
      data: {
        items,
        pagination: {
          total: count,
          totalPages,
          currentPage: page,
          pageSize,
          hasMore: page < totalPages
        }
      },
      status: 'success',
    });

  } catch (error) {
    console.error('Error searching products:', error);
    return corsResponse(
      { error: '搜索失败' },
      500
    );
  }
} 