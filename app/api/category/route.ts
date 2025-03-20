import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

// 获取所有类别（支持分页）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 验证分页参数
    if (page < 1 || pageSize < 1) {
      return NextResponse.json({ 
        error: '页码和每页数量必须大于0' 
      }, { status: 400 });
    }

    // 计算偏移量
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 获取总记录数
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (count === null) {
      throw new Error('Failed to get total count');
    }

    // 获取分页数据
    const { data: items, error } = await supabase
      .from('categories')
      .select('*')
      .range(from, to);
    
    if (error) throw error;

    // 计算总页数
    const totalPages = Math.ceil(count / pageSize);

    return NextResponse.json({
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
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
} 