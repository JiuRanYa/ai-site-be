import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS 预检请求处理
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只支持图片文件' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('image') // 确保在 Supabase 中创建了这个 bucket
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: '上传失败' },
        { status: 500, headers: corsHeaders }
      );
    }

    // 获取文件的公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      data: {
        url: publicUrl,
        fileName: fileName
      },
      status: 'success'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500, headers: corsHeaders }
    );
  }
} 