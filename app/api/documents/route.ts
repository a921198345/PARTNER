import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DocumentProcessor } from "@/lib/documents/processor";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// 设置为Edge运行时，优化文件处理性能
export const runtime = "nodejs";

/**
 * 获取文档列表
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
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email as string }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 解析查询参数
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const subjectId = url.searchParams.get("subjectId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    
    // 构建查询条件
    const where: any = {
      uploadedById: user.id,
    };
    
    // 添加搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    // 添加科目筛选
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    // 添加状态筛选
    if (status) {
      if (status === "processed") {
        where.processed = true;
      } else if (status === "pending") {
        where.processed = false;
        where.processingStatus = "pending";
      } else if (status === "processing") {
        where.processed = false;
        where.processingStatus = { in: ["processing", "text_extracted"] };
      } else if (status === "failed") {
        where.processed = false;
        where.processingStatus = "failed";
      }
    }
    
    // 获取文档列表
    const documents = await prismaClient.document.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        knowledgeEntries: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    // 处理返回格式
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      processed: doc.processed,
      processingStatus: doc.processingStatus,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      subjectId: doc.subjectId,
      subjectName: doc.subject?.name,
      subCategoryId: doc.subCategoryId,
      subCategoryName: doc.subCategory?.name,
      knowledgeEntryCount: doc.knowledgeEntries.length,
    }));
    
    // 获取总数
    const total = await prismaClient.document.count({ where });
    
    return NextResponse.json({
      success: true,
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取文档列表失败:", error);
    
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/**
 * 上传文档并处理
 * POST /api/documents
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "未提供文件" },
        { status: 400 }
      );
    }
    
    const subjectId = formData.get("subjectId") as string;
    if (!subjectId) {
      return NextResponse.json(
        { error: "未提供学科ID" },
        { status: 400 }
      );
    }
    
    const description = formData.get("description") as string || "";
    const tags = (formData.get("tags") as string || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // 处理文件
    const processor = new DocumentProcessor();
    const { fileName, fileType, fileSize, filePath } = await processor.saveFile(file);
    
    // 创建文档记录
    const document = await prisma.document.create({
      data: {
        title: fileName,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        fileUrl: filePath,
        description,
        subjectId,
        uploadedById: session.user.id,
        processingStatus: "pending", // 初始状态为待处理
      },
    });

    // 异步处理文档（提取知识点）
    processor.processDocument(document.id).catch((error) => {
      console.error(`处理文档失败 (ID: ${document.id}):`, error);
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("上传文档失败:", error);
    return NextResponse.json(
      { error: "上传文档失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除文档
 * DELETE /api/documents?id=123
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "文档ID为必填项" },
        { status: 400 }
      );
    }

    // 验证文档所有权
    const document = await prisma.document.findUnique({
      where: { id },
      select: { uploadedById: true, fileUrl: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: "文档不存在" },
        { status: 404 }
      );
    }

    if (document.uploadedById !== session.user.id) {
      return NextResponse.json(
        { error: "无权删除此文档" },
        { status: 403 }
      );
    }

    // 删除文件
    const processor = new DocumentProcessor();
    await processor.deleteFile(document.fileUrl);

    // 删除数据库记录及相关知识条目
    await prisma.$transaction([
      // 删除由该文档生成的知识条目
      prisma.knowledgeEntry.deleteMany({
        where: { source: { contains: id } },
      }),
      // 删除文档记录
      prisma.document.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除文档失败:", error);
    return NextResponse.json(
      { error: "删除文档失败" },
      { status: 500 }
    );
  }
} 