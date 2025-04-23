import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Supabase 客户端类型
type SupabaseClient = ReturnType<typeof createClient>

// 环境变量检查
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Supabase 认证选项
export const supabaseAuthOptions = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

/**
 * 创建带有cookie支持的Supabase客户端（用于用户身份认证）
 * 这个函数在Server Components中使用
 */
export function createServerClient(): SupabaseClient {
  // 获取所有 cookies
  const cookieStore = cookies()
  
  return createClient(
    supabaseAuthOptions.supabaseUrl,
    supabaseAuthOptions.supabaseKey,
    {
      // 在服务端组件中使用 cookies()
      cookies: {
        get(key) {
          return cookieStore.get(key)?.value
        },
        set(key, value, options) {
          try {
            cookieStore.set(key, value, options)
          } catch (error) {
            // 在 middleware 和 static site generation 期间会抛出错误
            // 可以忽略
          }
        },
        remove(key, options) {
          try {
            cookieStore.set(key, '', { ...options, maxAge: 0 })
          } catch (error) {
            // 同上
          }
        },
      },
    },
  )
}

/**
 * 创建具有管理员权限的Supabase客户端
 * 这个函数用于服务器端API路由中需要管理员权限的操作
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 