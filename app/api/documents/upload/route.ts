import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

/**
 * 处理文档上传
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
    
    // 使用formData解析请求
    const formData = await req.formData();
    
    // 获取文件和其他字段
    const file = formData.get("file") as File;
    const subjectId = formData.get("subjectId") as string;
    const subCategoryId = formData.get("subCategoryId") as string || null;
    
    if (!file) {
      return NextResponse.json(
        { error: "未提供文件" },
        { status: 400 }
      );
    }
    
    if (!subjectId) {
      return NextResponse.json(
        { error: "未提供科目ID" },
        { status: 400 }
      );
    }
    
    // 验证科目存在
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });
    
    if (!subject) {
      return NextResponse.json(
        { error: "科目不存在" },
        { status: 404 }
      );
    }
    
    // 如果指定了子类别，验证其存在
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { 
          id: subCategoryId,
          subjectId
        }
      });
      
      if (!subCategory) {
        return NextResponse.json(
          { error: "子类别不存在或不属于指定的科目" },
          { status: 404 }
        );
      }
    }
    
    // 准备文件信息
    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase() || "";
    const fileSize = file.size;
    
    // 生成唯一ID和存储路径
    const documentId = uuidv4();
    const uploadDir = join(process.cwd(), "uploads", subjectId);
    const filePath = join(uploadDir, `${documentId}.${fileType}`);
    
    // 创建目录(如果不存在)
    await mkdir(dirname(filePath), { recursive: true });
    
    // 保存文件到磁盘
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // 创建文档记录
    const document = await prisma.document.create({
      data: {
        id: documentId,
        title: fileName.split('.')[0], // 使用文件名作为标题
        fileName,
        fileType,
        fileSize,
        fileUrl: filePath,
        processed: false,
        processingStatus: "pending",
        uploadedBy: { connect: { id: user.id } },
        subject: { connect: { id: subjectId } },
        ...(subCategoryId ? { subCategory: { connect: { id: subCategoryId } } } : {})
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "文档上传成功",
      documentId: document.id
    });
  } catch (error) {
    console.error("文档上传失败:", error);
    
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
} 