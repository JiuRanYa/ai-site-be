import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db";
import { categories } from "@/db/schema";

// 获取所有类别
export async function GET(request: NextRequest) {
  try {
    const dbInstance = await db;
    const allCategories = await dbInstance.select().from(categories);

    return NextResponse.json({
      data: allCategories,
      status: 'success',
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// 创建新类别
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Category title is required' }, { status: 400 });
    }

    const dbInstance = await db;
    const newCategory = await dbInstance.insert(categories)
      .values({
        title,
        url,
        description,
      })
      .returning();

    return NextResponse.json({
      data: newCategory[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// 更新类别
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, description } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'Category ID and title are required' }, { status: 400 });
    }

    const dbInstance = await db;
    const updatedCategory = await dbInstance.update(categories)
      .set({
        title,
        url,
        description,
        updatedAt: new Date()
      })
      .where(eq(categories.id, id))
      .returning();

    if (updatedCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: updatedCategory[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// 删除类别
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const dbInstance = await db;
    const deletedCategory = await dbInstance.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (deletedCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: deletedCategory[0],
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

