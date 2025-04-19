import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromDocument } from "@/lib/documents/extractors";
import { getKnowledgePoints } from "@/lib/documents/knowledge-extractor";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";

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

// 获取文档列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject') || '';
    const subCategory = searchParams.get('subCategory') || '';
    
    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (subject) {
      where.subject = subject;
    }
    
    if (subCategory) {
      where.subCategory = subCategory;
    }
    
    // 获取文档数据
    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        subCategory: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("获取文档列表失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文档列表失败" },
      { status: 500 }
    );
  }
}

// 上传文档并提取知识点
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error, userId } = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error }, { status: 403 });
    }
    
    // 处理表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "未上传文件" },
        { status: 400 }
      );
    }
    
    // 获取元数据
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subject = formData.get('subject') as string;
    const subCategory = formData.get('subCategory') as string;
    
    if (!title || !subject) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }
    
    // 创建文档记录
    const document = await prisma.document.create({
      data: {
        title,
        description: description || '',
        subject,
        subCategory: subCategory || '',
        fileName: file.name,
        creatorId: userId,
      }
    });
    
    // 创建文件存储目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });
    
    // 保存文件
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, `${document.id}-${file.name}`);
    await writeFile(filePath, fileBuffer);
    
    // 设置响应流
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // 返回流响应
    const response = new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
    // 异步处理文档知识点提取
    (async () => {
      try {
        // 发送开始处理消息
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ status: 'processing', message: '开始处理文档...' })}\n\n`)
        );
        
        // 提取文档文本
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ status: 'processing', message: '提取文档文本...' })}\n\n`)
        );
        const text = await extractTextFromDocument(filePath);
        
        // 提取知识点
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ status: 'processing', message: '分析文档知识点...' })}\n\n`)
        );
        const knowledgePoints = await getKnowledgePoints(text, subject);
        
        // 保存知识点到数据库
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ status: 'processing', message: '保存知识点...' })}\n\n`)
        );
        
        for (const point of knowledgePoints) {
          await prisma.knowledgePoint.create({
            data: {
              title: point.title,
              content: point.content,
              tags: point.tags,
              importance: point.importance,
              documentId: document.id,
            }
          });
        }
        
        // 发送完成消息
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            status: 'completed', 
            message: '处理完成', 
            document: {
              id: document.id,
              title: document.title,
              pointsCount: knowledgePoints.length
            }
          })}\n\n`)
        );
      } catch (error) {
        console.error("处理文档失败:", error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ status: 'error', message: `处理失败: ${error.message}` })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();
    
    return response;
  } catch (error) {
    console.error("上传文档失败:", error);
    return NextResponse.json(
      { success: false, error: "上传文档失败" },
      { status: 500 }
    );
  }
}

// 文本编码器
const encoder = new TextEncoder();

// 删除知识点或文档
export async function DELETE(req: Request) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }
    
    // 检查用户是否有管理员权限
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "权限不足" },
        { status: 403 }
      );
    }
    
    // 解析请求参数
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type") || "knowledge"; // knowledge 或 document
    
    if (!id) {
      return NextResponse.json(
        { message: "缺少ID参数" },
        { status: 400 }
      );
    }
    
    if (type === "document") {
      // 删除文档及其知识点
      await KnowledgeService.deleteDocument(id);
    } else {
      // 删除单个知识点
      await KnowledgeService.deleteKnowledgePoint(id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除知识点或文档失败:", error);
    return NextResponse.json(
      { message: "处理请求时出现错误" },
      { status: 500 }
    );
  }
}

// 更新知识点
export async function PATCH(req: Request) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }
    
    // 检查用户是否有管理员权限
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "权限不足" },
        { status: 403 }
      );
    }
    
    // 解析请求体
    const body = await req.json();
    const { id, title, content, importance } = body;
    
    if (!id) {
      return NextResponse.json(
        { message: "缺少ID参数" },
        { status: 400 }
      );
    }
    
    // 更新知识点
    const updated = await KnowledgeService.updateKnowledgePoint(id, {
      title,
      content,
      importance,
    });
    
    return NextResponse.json({ knowledgePoint: updated });
  } catch (error) {
    console.error("更新知识点失败:", error);
    return NextResponse.json(
      { message: "处理请求时出现错误" },
      { status: 500 }
    );
  }
} 