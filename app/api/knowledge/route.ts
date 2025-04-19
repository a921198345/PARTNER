import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KnowledgeService } from "@/lib/knowledge/service";

// 设置为Node.js运行时，确保可以访问身份验证选项和Prisma数据库
export const runtime = "nodejs";

/**
 * 获取知识条目
 * GET /api/knowledge?query=行政法&subjectId=1&limit=5
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "未授权访问" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const subjectId = searchParams.get("subjectId") || undefined;
    const limit = Number(searchParams.get("limit") || "10");
    
    const knowledgeService = new KnowledgeService();
    const results = await knowledgeService.searchKnowledge(
      query,
      subjectId,
      limit
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("获取知识条目失败:", error);
    return NextResponse.json(
      { error: "获取知识条目失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建或更新知识条目
 * POST /api/knowledge
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "未授权访问" },
        { status: 401 }
      );
    }
    
    // 检查用户权限（只有管理员可以创建/编辑知识条目）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "权限不足" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { 
      id, 
      title, 
      content, 
      tags, 
      subjectId, 
      subCategoryId, 
      importance = 3,
      source
    } = data;

    if (!title || !content || !subjectId) {
      return NextResponse.json(
        { error: "标题、内容和学科ID为必填项" },
        { status: 400 }
      );
    }

    // 标签处理
    const tagArray = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()) 
      : Array.isArray(tags) ? tags : [];

    // 创建或更新知识条目
    const knowledgeEntry = await prisma.knowledgeEntry.upsert({
      where: { id: id || 'create-new-entry' },
      update: {
        title,
        content,
        tags: tagArray,
        subjectId,
        subCategoryId,
        importance,
        source,
        updatedAt: new Date(),
      },
      create: {
        title,
        content,
        tags: tagArray,
        subjectId,
        subCategoryId,
        importance,
        source,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(knowledgeEntry);
  } catch (error) {
    console.error("创建/更新知识条目失败:", error);
    return NextResponse.json(
      { error: "创建/更新知识条目失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除知识条目
 * DELETE /api/knowledge?id=123
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "未授权访问" },
        { status: 401 }
      );
    }
    
    // 检查用户权限（只有管理员可以删除知识条目）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "权限不足" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "知识条目ID为必填项" },
        { status: 400 }
      );
    }

    // 删除知识条目
    await prisma.knowledgeEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除知识条目失败:", error);
    return NextResponse.json(
      { error: "删除知识条目失败" },
      { status: 500 }
    );
  }
} 