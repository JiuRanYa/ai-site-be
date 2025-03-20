import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 检查环境变量
if (!process.env.SUPABASE_URL) {
  throw new Error('缺少环境变量：SUPABASE_URL');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('缺少环境变量：SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 