import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 验证用户是否是管理员
async function validateAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { isAdmin: false, error: "未登录" };
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  if (!user || user.role !== "ADMIN") {
    return { isAdmin: false, error: "无管理员权限" };
  }
  
  return { isAdmin: true, userId: session.user.id };
}

// 获取知识点列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const subjectId = searchParams.get('subjectId');
    const subCategoryId = searchParams.get('subCategoryId');
    const search = searchParams.get('search');
    
    // 构建查询条件
    const where: any = {};
    
    if (documentId) {
      where.documentId = documentId;
    }
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }
    
    // 获取知识点列表
    const knowledgePoints = await prisma.knowledgePoint.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({ 
      success: true, 
      knowledgePoints 
    });
  } catch (error) {
    console.error("获取知识点列表失败:", error);
    return NextResponse.json(
      { success: false, error: "获取知识点列表失败" },
      { status: 500 }
    );
  }
}

// 创建新知识点
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    // 获取请求数据
    const data = await request.json();
    
    // 验证必要字段
    if (!data.title || !data.content || !data.documentId) {
      return NextResponse.json(
        { success: false, error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 检查文档是否存在
    const document = await prisma.document.findUnique({
      where: { id: data.documentId },
      select: { id: true, subjectId: true, subCategoryId: true }
    });
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: "文档不存在" },
        { status: 404 }
      );
    }
    
    // 创建知识点
    const knowledgePoint = await prisma.knowledgePoint.create({
      data: {
        title: data.title,
        content: data.content,
        importance: data.importance || "MEDIUM",
        tags: data.tags || [],
        documentId: data.documentId,
        subjectId: document.subjectId,
        subCategoryId: document.subCategoryId
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      knowledgePoint 
    });
  } catch (error) {
    console.error("创建知识点失败:", error);
    return NextResponse.json(
      { success: false, error: "创建知识点失败" },
      { status: 500 }
    );
  }
} 