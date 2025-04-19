import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DocumentProcessor } from "@/lib/documents/processor";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 启动文档处理任务
 */
export async function POST(req: NextRequest) {
  try {
    // 检查用户身份验证
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    // 获取请求体
    const body = await req.json();
    const { documentIds } = body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "请提供有效的文档ID列表" },
        { status: 400 }
      );
    }
    
    // 验证文档存在并属于当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 验证所有文档是否有效
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        uploadedById: user.id
      }
    });
    
    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: "部分文档ID无效或不属于当前用户" },
        { status: 400 }
      );
    }
    
    // 创建处理任务
    const job = await DocumentProcessor.createProcessingJob(
      documentIds,
      user.id
    );
    
    // 为了测试目的，立即处理一个文档
    // 注意：生产环境中应该使用后台服务
    DocumentProcessor.processQueue().catch(console.error);
    
    return NextResponse.json({
      success: true,
      message: "文档处理任务已创建",
      job: {
        id: job.id,
        status: job.status,
        documentsCount: documents.length
      }
    });
  } catch (error) {
    console.error("创建文档处理任务失败:", error);
    
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/**
 * 获取处理任务列表
 */
export async function GET(req: NextRequest) {
  try {
    // 检查用户身份验证
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 获取该用户的处理任务
    const jobs = await prisma.processingJob.findMany({
      where: {
        userId: user.id
      },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            fileName: true,
            processingStatus: true
          }
        }
      },
      orderBy: {
        startTime: "desc"
      }
    });
    
    return NextResponse.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error("获取处理任务列表失败:", error);
    
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
} 