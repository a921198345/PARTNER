import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase/client';

// GET请求处理函数
export async function GET() {
  try {
    // 测试Supabase连接
    const connectionResult = await testSupabaseConnection();
    
    // 返回测试结果
    return NextResponse.json(connectionResult);
  } catch (error) {
    // 处理错误
    console.error('测试Supabase连接时出错:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 