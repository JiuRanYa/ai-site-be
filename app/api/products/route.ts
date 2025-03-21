import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db";
import { products } from "@/db/schema";
import { categories } from "@/db/schema/products";
import { sql } from "drizzle-orm";

// 获取所有产品（支持分页和分类筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
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
    if (category) {
      // 先查找分类ID
      const categoryResult = await dbInstance
        .select()
        .from(categories)
        .where(eq(categories.name, category))
        .limit(1);

      if (categoryResult.length === 0) {
        return NextResponse.json({ 
          error: '未找到指定的分类' 
        }, { status: 404 });
      }

      whereCondition = eq(products.categoryId, categoryResult[0].id);
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
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// 创建新产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description, tags, categoryId } = body;

    if (!title || !categoryId) {
      return NextResponse.json({ error: 'Product title and category ID are required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// 更新产品
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, description, categoryId } = body;

    if (!id || !title || !categoryId) {
      return NextResponse.json({ error: 'Product ID, title, and category ID are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: updatedProduct[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// 删除产品
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const dbInstance = await db;
    const deletedProduct = await dbInstance.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: deletedProduct[0],
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

