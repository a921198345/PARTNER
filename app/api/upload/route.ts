import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from 'uuid'

// 最大允许的文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// 允许上传的文件类型
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/msword",
]

export async function POST(request: NextRequest) {
  try {
    // 检查用户是否为管理员
    // 在实际项目中，需要进行身份验证和权限检查
    // 如果非管理员，则返回401或403错误
    
    // 获取请求体中的文件数据
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string || "other"
    
    if (!file) {
      return NextResponse.json(
        { error: "没有找到上传文件" },
        { status: 400 }
      )
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件过大，最大支持 ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }
    
    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      )
    }
    
    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `knowledge/${category}/${fileName}`
    
    // 获取文件内容
    const fileBuffer = await file.arrayBuffer()
    
    try {
      // 获取 Supabase 客户端
      const supabase = createServerSupabaseClient()
      
      // 上传文件到 Supabase Storage
      const { data, error } = await supabase
        .storage
        .from("documents")
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600'
        })
      
      if (error) {
        console.error("Supabase 上传错误:", error)
        // 如果是因为存储桶不存在的错误，返回更明确的错误信息
        if (error.message.includes("bucket") && error.message.includes("not found")) {
          return NextResponse.json(
            { error: "Supabase存储桶'documents'不存在，请在Supabase控制台创建" },
            { status: 500 }
          )
        }
        throw new Error("文件上传失败: " + error.message)
      }
      
      // 获取文件的公共 URL
      const { data: urlData } = supabase
        .storage
        .from("documents")
        .getPublicUrl(filePath)
      
      // 创建知识库记录
      const { data: recordData, error: recordError } = await supabase
        .from("knowledge_files")
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          category: category,
          public_url: urlData.publicUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (recordError) {
        console.error("知识库记录创建失败:", recordError)
        // 如果是因为表不存在的错误，返回更明确的错误信息
        if (recordError.message.includes("relation") && recordError.message.includes("does not exist")) {
          return NextResponse.json(
            { error: "Supabase数据表'knowledge_files'不存在，请在Supabase控制台创建" },
            { status: 500 }
          )
        }
        throw new Error("知识库记录创建失败: " + recordError.message)
      }
      
      return NextResponse.json({
        success: true,
        message: "文件上传成功",
        data: {
          filePath,
          publicUrl: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
      })
    } catch (error) {
      console.error("文件上传处理错误:", error)
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "文件上传失败" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("文件上传请求处理错误:", error)
    return NextResponse.json(
      { success: false, error: "文件上传处理失败" },
      { status: 500 }
    )
  }
} 