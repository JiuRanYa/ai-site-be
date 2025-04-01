import { NextRequest } from "next/server";
import { s3Client } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { corsResponse, corsOptionsResponse } from "@/lib/cors";

// OPTIONS 预检请求处理
export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    // 验证 bucket 是否存在
    const { data: buckets, error: bucketsError } = await s3Client
      .listBuckets({});

    if (bucketsError) {
      console.error('Bucket error:', bucketsError);
      return corsResponse(
        { error: '存储配置错误' },
        500
      );
    }

    // 检查 images bucket 是否存在，如果不存在则创建
    const imagesBucket = buckets?.Buckets?.find(b => b.Name === 'images');
    if (!imagesBucket) {
      const { error: createBucketError } = await s3Client
        .createBucket({
          Bucket: 'images',
          CreateBucketConfiguration: {
            LocationConstraint: 'us-east-1'
          }
        });

      if (createBucketError) {
        console.error('Create bucket error:', createBucketError);
        return corsResponse(
          { error: '创建存储空间失败' },
          500
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return corsResponse(
        { error: '没有找到文件' },
        400
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return corsResponse(
        { error: '只支持图片文件' },
        400
      );
    }

    // 验证文件大小（2MB限制）
    if (file.size > 2 * 1024 * 1024) {
      return corsResponse(
        { error: '文件大小不能超过2MB' },
        400
      );
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 上传到 Supabase Storage（通过 S3 客户端）
    try {
      const command = new PutObjectCommand({
        Bucket: 'images',
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
        CacheControl: 'max-age=3600'
      });

      await s3Client.send(command);

      // 构建公共访问 URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

      return corsResponse({
        data: {
          url: publicUrl,
          fileName: fileName
        },
        status: 'success'
      });

    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      return corsResponse(
        { error: '上传失败: ' + (uploadError as Error).message },
        500
      );
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return corsResponse(
      { error: '上传失败' },
      500
    );
  }
} 