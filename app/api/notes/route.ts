import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// 获取笔记列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json(
      { message: "获取笔记过程中出现错误" },
      { status: 500 }
    );
  }
}

// 创建笔记
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { title, content, attachments } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    // 生成思维导图的逻辑
    // 这里我们将从内容中提取关键概念，模拟思维导图生成
    // 实际项目中应该调用一个AI服务来生成
    const generateMindMap = (content: string) => {
      // 简单示例：提取标题和段落，创建简单的层级结构
      const lines = content.split('\n').filter(line => line.trim());
      const rootNode = { id: 'root', text: title, children: [] };
      
      let currentSection = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#')) {
          // 标题行
          currentSection = {
            id: `node-${Math.random().toString(36).substring(2, 9)}`,
            text: trimmedLine.replace(/^#+\s*/, ''),
            children: []
          };
          rootNode.children.push(currentSection);
        } else if (currentSection && trimmedLine) {
          // 内容行
          currentSection.children.push({
            id: `node-${Math.random().toString(36).substring(2, 9)}`,
            text: trimmedLine,
            children: []
          });
        }
      }
      
      return rootNode;
    };

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content,
        mindMap: generateMindMap(content),
      },
    });

    // 处理附件
    if (attachments && attachments.length > 0) {
      const attachmentPromises = attachments.map((attachment: any) =>
        prisma.attachment.create({
          data: {
            noteId: note.id,
            fileUrl: attachment.fileUrl,
            fileType: attachment.fileType,
          },
        })
      );

      await Promise.all(attachmentPromises);
    }

    // 获取包含附件的完整笔记
    const noteWithAttachments = await prisma.note.findUnique({
      where: { id: note.id },
      include: { attachments: true },
    });

    return NextResponse.json(noteWithAttachments, { status: 201 });
  } catch (error) {
    console.error("创建笔记失败:", error);
    return NextResponse.json(
      { message: "创建笔记过程中出现错误" },
      { status: 500 }
    );
  }
} 