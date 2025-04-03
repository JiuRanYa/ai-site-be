import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { submits } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const image = formData.get('image') as File;

    // 验证必填字段
    if (!title || !url || !image) {
      return NextResponse.json(
        { error: '标题、URL和图片为必填项' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '无效的URL格式' },
        { status: 400 }
      );
    }

    // 验证图片类型
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只支持图片文件' },
        { status: 400 }
      );
    }

    // 验证图片大小（最大2MB）
    if (image.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片大小不能超过2MB' },
        { status: 400 }
      );
    }

    // 保存到数据库
    const dbInstance = await db;
    const newSubmit = await dbInstance.insert(submits)
      .values({
        title,
        url,
        description: description || null,
        tags: tags ? JSON.parse(tags) : [],
        image: image.type, // 只保存图片的文件格式
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json({
      data: newSubmit[0],
      status: 'success',
      message: '提交成功，等待审核'
    });

  } catch (error) {
    console.error('Error creating submit:', error);
    return NextResponse.json(
      { error: '提交失败' },
      { status: 500 }
    );
  }
}

// 获取提交列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || 'pending';

    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const offset = (page - 1) * pageSize;

    const [submitsList, total] = await Promise.all([
      dbInstance.select()
        .from(submits)
        .where(eq(submits.status, status))
        .limit(pageSize)
        .offset(offset)
        .orderBy(sql`${submits.createdAt} DESC`),
      dbInstance.select({ count: count() })
        .from(submits)
        .where(eq(submits.status, status))
    ]);

    const totalPages = Math.ceil(total[0].count / pageSize);

    return NextResponse.json({
      data: submitsList,
      pagination: {
        total: total[0].count,
        page,
        pageSize,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching submits:', error);
    return NextResponse.json(
      { error: '获取提交列表失败' },
      { status: 500 }
    );
  }
} 