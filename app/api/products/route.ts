import { NextRequest, NextResponse } from "next/server";
import { eq, sql, ilike, or } from "drizzle-orm";
import db from "@/db";
import { products } from "@/db/schema";

// 获取所有产品（支持分页和搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSizeParam = searchParams.get('pageSize') || '10';
    const query = searchParams.get('q') || '';

    // 验证分页参数
    if (page < 1) {
      return NextResponse.json({ 
        error: '页码必须大于0' 
      }, { status: 400 });
    }

    // 处理 pageSize=all 的情况
    const pageSize = pageSizeParam === 'all' ? undefined : parseInt(pageSizeParam);
    if (pageSize !== undefined && pageSize < 1) {
      return NextResponse.json({ 
        error: '每页数量必须大于0' 
      }, { status: 400 });
    }

    // 计算正确的偏移量
    const offset = pageSize ? (page - 1) * pageSize : undefined;
    const dbInstance = await db;

    // 构建查询条件
    let whereCondition = undefined;

    // 如果有搜索关键词，添加搜索条件
    if (query) {
      whereCondition = or(
        ilike(products.title, `%${query}%`),
        ilike(products.description, `%${query}%`),
        sql`${products.tags}::text ILIKE ${`%${query}%`}`
      );
    }

    // 添加调试日志
    console.log('分页参数:', {
      page,
      pageSize,
      offset,
      query,
      whereCondition
    });
    
    // 获取总记录数
    const [{ count }] = await dbInstance
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereCondition) as [{ count: number }];

    // 添加调试日志
    console.log('总记录数:', count);

    // 获取数据
    let queryBuilder = dbInstance
      .select()
      .from(products)
      .where(whereCondition)
      .orderBy(
        sql`${products.createdAt} DESC`,
        sql`${products.id} DESC`  // 添加 id 作为第二排序字段
      );

    // 如果指定了分页，添加分页限制
    if (pageSize && offset !== undefined) {
      queryBuilder = queryBuilder.limit(pageSize).offset(offset) as any;
    }

    const items = await queryBuilder;

    // 添加调试日志
    console.log('查询结果:', {
      itemsCount: items.length,
      firstItemId: items[0]?.id,
      lastItemId: items[items.length - 1]?.id
    });

    // 计算分页信息
    const totalPages = pageSize ? Math.ceil(count / pageSize) : 1;

    return NextResponse.json({
      data: {
        items,
        pagination: {
          total: count,
          totalPages,
          currentPage: page,
          pageSize: pageSize || count,
          hasMore: pageSize ? page < totalPages : false
        }
      },
      status: 'success',
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: '获取产品列表失败' },
      { status: 500 }
    );
  }
}

// 创建新产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: '产品标题是必需的' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const newProduct = await dbInstance.insert(products)
      .values({
        title,
        url,
        description,
        tags
      })
      .returning();

    return NextResponse.json({
      data: newProduct[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: '创建产品失败' },
      { status: 500 }
    );
  }
}

// 更新产品
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, description } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: '产品ID和标题是必需的' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const updatedProduct = await dbInstance.update(products)
      .set({
        title,
        url,
        description,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { error: '未找到指定的产品' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedProduct[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: '更新产品失败' },
      { status: 500 }
    );
  }
}

// 删除产品
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '产品ID是必需的' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const deletedProduct = await dbInstance.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json(
        { error: '未找到指定的产品' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: deletedProduct[0],
      status: 'success',
      message: '产品删除成功'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: '删除产品失败' },
      { status: 500 }
    );
  }
}

