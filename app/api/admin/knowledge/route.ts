import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * 获取知识库文件列表
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    
    // 查询参数
    const category = url.searchParams.get("category")
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const offset = parseInt(url.searchParams.get("offset") || "0")
    
    // 构建查询
    let query = supabase
      .from("knowledge_files")
      .select("*", { count: "exact" })
    
    // 如果有分类筛选
    if (category) {
      query = query.eq("category", category)
    }
    
    // 执行查询
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error("获取知识库文件列表出错:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: count,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error("处理知识库文件列表请求时出错:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * 删除知识库文件
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    const fileId = url.searchParams.get("id")
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, message: "缺少文件ID" },
        { status: 400 }
      )
    }
    
    // 先获取文件路径
    const { data: fileData, error: fileError } = await supabase
      .from("knowledge_files")
      .select("file_path")
      .eq("id", fileId)
      .single()
    
    if (fileError) {
      console.error("获取文件信息出错:", fileError)
      return NextResponse.json(
        { success: false, message: fileError.message },
        { status: 500 }
      )
    }
    
    if (!fileData) {
      return NextResponse.json(
        { success: false, message: "文件不存在" },
        { status: 404 }
      )
    }
    
    // 从存储中删除文件
    const { error: storageError } = await supabase
      .storage
      .from("documents")
      .remove([fileData.file_path])
    
    if (storageError) {
      console.error("从存储中删除文件出错:", storageError)
      return NextResponse.json(
        { success: false, message: storageError.message },
        { status: 500 }
      )
    }
    
    // 从数据库中删除记录
    const { error: dbError } = await supabase
      .from("knowledge_files")
      .delete()
      .eq("id", fileId)
    
    if (dbError) {
      console.error("从数据库中删除文件记录出错:", dbError)
      return NextResponse.json(
        { success: false, message: dbError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "文件删除成功",
      data: { id: fileId }
    })
  } catch (error) {
    console.error("处理删除知识库文件请求时出错:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * 更新知识库文件信息
 */
export async function PATCH(request: NextRequest) {
  try {
    // 获取请求体数据
    const body = await request.json()
    const { id, category } = body
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少文件ID" },
        { status: 400 }
      )
    }
    
    // 检查用户是否为管理员
    // 在实际项目中，需要进行身份验证和权限检查
    
    if (process.env.NODE_ENV === "production") {
      // 获取 Supabase 客户端
      const supabase = createServerSupabaseClient()
      
      // 更新文件分类
      const { data, error } = await supabase
        .from("knowledge_files")
        .update({ 
          category,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single()
      
      if (error) {
        console.error("更新文件信息失败:", error)
        return NextResponse.json(
          { error: "更新文件信息失败" },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        message: "文件信息更新成功",
        file: data,
      })
    } else {
      // 开发环境模拟更新
      // 等待 500ms 模拟更新操作
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return NextResponse.json({
        message: "文件信息更新成功（开发环境模拟）",
        file: {
          id,
          category,
          updated_at: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error("更新知识库文件信息错误:", error)
    return NextResponse.json(
      { error: "更新文件信息失败" },
      { status: 500 }
    )
  }
} 