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

// 获取单个知识点
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
    
    const pointId = params.id;
    
    // 获取知识点信息
    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: pointId },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            subject: true,
            subCategory: true
          }
        }
      }
    });
    
    if (!knowledgePoint) {
      return NextResponse.json(
        { success: false, error: "知识点不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, knowledgePoint });
  } catch (error) {
    console.error("获取知识点信息失败:", error);
    return NextResponse.json(
      { success: false, error: "获取知识点信息失败" },
      { status: 500 }
    );
  }
}

// 更新知识点
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
    
    const pointId = params.id;
    const data = await request.json();
    
    // 检查知识点是否存在
    const existingPoint = await prisma.knowledgePoint.findUnique({
      where: { id: pointId }
    });
    
    if (!existingPoint) {
      return NextResponse.json(
        { success: false, error: "知识点不存在" },
        { status: 404 }
      );
    }
    
    // 更新知识点
    const updatedPoint = await prisma.knowledgePoint.update({
      where: { id: pointId },
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        importance: data.importance
      }
    });
    
    return NextResponse.json({ success: true, knowledgePoint: updatedPoint });
  } catch (error) {
    console.error("更新知识点失败:", error);
    return NextResponse.json(
      { success: false, error: "更新知识点失败" },
      { status: 500 }
    );
  }
}

// 删除知识点
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
    
    const pointId = params.id;
    
    // 检查知识点是否存在
    const existingPoint = await prisma.knowledgePoint.findUnique({
      where: { id: pointId }
    });
    
    if (!existingPoint) {
      return NextResponse.json(
        { success: false, error: "知识点不存在" },
        { status: 404 }
      );
    }
    
    // 删除知识点
    await prisma.knowledgePoint.delete({
      where: { id: pointId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除知识点失败:", error);
    return NextResponse.json(
      { success: false, error: "删除知识点失败" },
      { status: 500 }
    );
  }
} 