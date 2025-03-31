import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_PROJECT_ID');
}

if (!process.env.SUPABASE_ACCESS_KEY_ID) {
  throw new Error('Missing env.SUPABASE_ACCESS_KEY_ID');
}

if (!process.env.SUPABASE_SECRET_ACCESS_KEY) {
  throw new Error('Missing env.SUPABASE_SECRET_ACCESS_KEY');
}

export const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'us-east-1', // Supabase 使用这个区域
  endpoint: `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
  }
}); 