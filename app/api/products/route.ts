import { NextRequest, NextResponse } from "next/server";
import { eq, sql, ilike, or } from "drizzle-orm";
import db from "@/db";
import { products } from "@/db/schema";

// 获取所有产品（支持分页和搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');

    // 验证分页参数
    if (page < 1 || pageSize < 1) {
      return NextResponse.json({ 
        error: '页码和每页数量必须大于0' 
      }, { status: 400 });
    }

    const offset = (page - 1) * pageSize;
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

    // 如果有分类，添加分类条件
    if (category) {
      const categoryCondition = eq(products.categoryId, parseInt(category));
      whereCondition = whereCondition 
        ? or(whereCondition, categoryCondition)
        : categoryCondition;
    }
    
    // 获取总记录数
    const [{ count }] = await dbInstance
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereCondition) as [{ count: number }];

    // 获取分页数据
    const items = await dbInstance
      .select()
      .from(products)
      .where(whereCondition)
      .orderBy(products.createdAt)
      .limit(pageSize)
      .offset(offset);

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
    const { title, url, description, tags, categoryId } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: '产品标题和分类ID是必需的' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const newProduct = await dbInstance.insert(products)
      .values({
        title,
        url,
        description,
        tags,
        categoryId
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
    const { id, title, url, description, categoryId } = body;

    if (!id || !title || !categoryId) {
      return NextResponse.json(
        { error: '产品ID、标题和分类ID是必需的' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const updatedProduct = await dbInstance.update(products)
      .set({
        title,
        url,
        description,
        categoryId,
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

