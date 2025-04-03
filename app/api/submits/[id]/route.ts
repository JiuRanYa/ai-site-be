import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submits } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // 验证状态
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      );
    }

    const dbInstance = await db;
    const updatedSubmit = await dbInstance.update(submits)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(submits.id, parseInt(id)))
      .returning();

    if (updatedSubmit.length === 0) {
      return NextResponse.json(
        { error: '未找到指定的提交' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedSubmit[0],
      status: 'success',
      message: status === 'approved' ? '已通过审核' : '已拒绝'
    });

  } catch (error) {
    console.error('Error updating submit:', error);
    return NextResponse.json(
      { error: '更新提交状态失败' },
      { status: 500 }
    );
  }
} 