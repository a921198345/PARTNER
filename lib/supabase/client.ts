import { createClient } from '@supabase/supabase-js'

// 检查环境变量
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 创建单例客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建浏览器客户端
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

// 测试Supabase连接函数
export async function testSupabaseConnection() {
  try {
    // 使用rpc调用检查数据库连接而不是查询具体表
    const { data, error } = await supabaseClient.rpc('get_postgres_version')
    
    if (error) {
      // 如果rpc调用失败，尝试更简单的检查
      try {
        // 检查存储桶列表，这不需要特定表存在
        const { error: storageError } = await supabaseClient.storage.getBuckets()
        
        if (storageError) {
          console.error('Supabase连接测试失败:', storageError.message)
          return { success: false, message: storageError.message }
        }
        
        return { success: true, message: '连接成功（已验证存储服务）' }
      } catch (innerError) {
        console.error('Supabase存储连接测试失败:', innerError)
        return { success: false, message: `存储服务连接失败: ${innerError instanceof Error ? innerError.message : '未知错误'}` }
      }
    }
    
    return { success: true, message: '连接成功（已验证PostgreSQL服务）', version: data }
  } catch (error) {
    console.error('Supabase连接测试异常:', error)
    return { success: false, message: error instanceof Error ? error.message : '未知错误' }
  }
} 