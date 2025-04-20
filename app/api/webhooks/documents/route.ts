import { NextRequest, NextResponse } from "next/server";
import { DocumentProcessor } from "@/lib/documents/processor";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 初始化后台处理服务（在应用启动时运行一次）
let processorInitialized = false;

const initProcessor = async () => {
  if (!processorInitialized) {
    processorInitialized = true;
    console.log("初始化文档处理后台服务");
    
    // 启动后台处理器，每1分钟检查一次处理队列
    DocumentProcessor.startBackgroundProcessor(60000)
      .catch(error => {
        console.error("启动文档处理后台服务失败:", error);
        processorInitialized = false; // 允许重试
      });
  }
};

// 尝试初始化处理器
initProcessor();

/**
 * 处理文档上传和处理的webhook
 * 这可以被云存储服务或文件上传完成事件触发
 */
export async function POST(req: NextRequest) {
  try {
    // 验证webhook请求
    const authHeader = req.headers.get("authorization");
    
    // 在生产环境中，应该使用更安全的身份验证方法
    if (!authHeader || authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    // 获取请求体
    const body = await req.json();
    const { event, documentId, userId } = body;
    
    if (!event || !documentId) {
      return NextResponse.json(
        { error: "请求缺少必要参数" },
        { status: 400 }
      );
    }
    
    if (event === "document.uploaded") {
      // 验证文档存在
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });
      
      if (!document) {
        return NextResponse.json(
          { error: "文档不存在" },
          { status: 404 }
        );
      }
      
      // 创建处理任务
      const job = await DocumentProcessor.createProcessingJob(
        [documentId],
        document.uploadedById
      );
      
      return NextResponse.json({
        success: true,
        message: "文档处理任务已创建",
        job: {
          id: job.id,
          status: job.status
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: "未知事件类型"
    });
  } catch (error) {
    console.error("处理文档webhook失败:", error);
    
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
} 