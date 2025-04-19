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

// 获取知识库统计数据
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    // 总文档数
    const totalDocuments = await prisma.document.count();
    
    // 总知识点数
    const totalKnowledgePoints = await prisma.knowledgePoint.count();
    
    // 按重要性分布
    const pointsByImportance = {
      HIGH: await prisma.knowledgePoint.count({ where: { importance: 'HIGH' } }),
      MEDIUM: await prisma.knowledgePoint.count({ where: { importance: 'MEDIUM' } }),
      LOW: await prisma.knowledgePoint.count({ where: { importance: 'LOW' } })
    };
    
    // 按学科分布的文档数
    const documentsBySubjectRaw = await prisma.document.groupBy({
      by: ['subject'],
      _count: {
        id: true
      }
    });
    
    const documentsBySubject = documentsBySubjectRaw.reduce((acc, curr) => {
      acc[curr.subject] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    // 按学科分布的知识点数
    const pointsBySubjectRaw = await prisma.knowledgePoint.groupBy({
      by: ['subject'],
      _count: {
        id: true
      }
    });
    
    const pointsBySubject = pointsBySubjectRaw.reduce((acc, curr) => {
      acc[curr.subject] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    // 最多查看的知识点
    const topViewedPoints = await prisma.knowledgePoint.findMany({
      orderBy: {
        viewCount: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        viewCount: true
      }
    });
    
    // 最近添加的文档
    const recentDocuments = await prisma.document.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            knowledgePoints: true
          }
        }
      }
    });
    
    // 转换日期格式，并添加知识点数量
    const formattedRecentDocuments = recentDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt.toISOString(),
      knowledgePointCount: doc._count.knowledgePoints
    }));
    
    // 返回统计数据
    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments,
        totalKnowledgePoints,
        pointsByImportance,
        documentsBySubject,
        pointsBySubject,
        topViewedPoints,
        recentDocuments: formattedRecentDocuments
      }
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { success: false, error: "获取统计数据失败" },
      { status: 500 }
    );
  }
} 