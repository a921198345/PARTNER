import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

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

// 获取单个文档及其知识点
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    const documentId = params.id;
    
    // 获取文档信息
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        knowledgePoints: {
          orderBy: { 
            importance: "desc" 
          }
        },
        creator: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: "文档不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("获取文档信息失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文档信息失败" },
      { status: 500 }
    );
  }
}

// 更新文档和知识点
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    const documentId = params.id;
    const { document, knowledgePoints } = await request.json();
    
    // 检查文档是否存在
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!existingDocument) {
      return NextResponse.json(
        { success: false, error: "文档不存在" },
        { status: 404 }
      );
    }
    
    // 更新文档信息
    if (document) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          title: document.title,
          description: document.description,
          subject: document.subject,
          subCategory: document.subCategory
        }
      });
    }
    
    // 更新知识点
    if (knowledgePoints && Array.isArray(knowledgePoints)) {
      // 处理每个知识点
      for (const point of knowledgePoints) {
        if (point.id) {
          // 更新现有知识点
          if (point._delete) {
            // 删除知识点
            await prisma.knowledgePoint.delete({
              where: { id: point.id }
            });
          } else {
            // 更新知识点
            await prisma.knowledgePoint.update({
              where: { id: point.id },
              data: {
                title: point.title,
                content: point.content,
                tags: point.tags,
                importance: point.importance
              }
            });
          }
        } else if (!point._delete) {
          // 创建新知识点
          await prisma.knowledgePoint.create({
            data: {
              title: point.title,
              content: point.content,
              tags: point.tags,
              importance: point.importance,
              documentId
            }
          });
        }
      }
    }
    
    // 获取更新后的文档
    const updatedDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        knowledgePoints: {
          orderBy: { 
            importance: "desc" 
          }
        }
      }
    });
    
    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error("更新文档失败:", error);
    return NextResponse.json(
      { success: false, error: "更新文档失败" },
      { status: 500 }
    );
  }
}

// 删除文档及其知识点
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    const documentId = params.id;
    
    // 检查文档是否存在
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { 
        id: true,
        fileName: true
      }
    });
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: "文档不存在" },
        { status: 404 }
      );
    }
    
    // 删除关联的知识点
    await prisma.knowledgePoint.deleteMany({
      where: { documentId }
    });
    
    // 删除文档记录
    await prisma.document.delete({
      where: { id: documentId }
    });
    
    // 尝试删除文件
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        'documents',
        `${documentId}-${document.fileName}`
      );
      
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn("文件删除失败:", fileError);
      // 继续执行，不影响API响应
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除文档失败:", error);
    return NextResponse.json(
      { success: false, error: "删除文档失败" },
      { status: 500 }
    );
  }
} 