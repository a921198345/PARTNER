import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeepSeekService } from "@/services/DeepSeekService";
import { Message } from "ai";

// 使用nodejs运行时而不是edge运行时，确保能正确访问authOptions和prisma
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 解析请求数据
    const { messages, createNote } = await req.json();

    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    // 确保用户已登录并且session.user存在
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 创建或更新每日学习目标
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyStudyGoal.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      },
      update: {
        chatCount: { increment: 1 }
      },
      create: {
        userId: user.id,
        date: today,
        chatCount: 1,
        noteCount: 0,
        quizCount: 0,
        studyTime: 0
      }
    });

    // 构建系统提示
    const systemPrompt = `你是一个友好的AI学习助手，名为"考试伙伴"，专注于帮助用户备考${user.profile?.subject || '各类考试'}。
    
你应该:
- 提供准确、简洁的知识点解释
- 使用友好、鼓励的语气 😊
- 适当使用表情符号使对话更加生动
- 在回答中参考相关的考试知识点
- 提供学习技巧和记忆方法
- 避免过于复杂的专业术语，使用通俗易懂的语言
- 鼓励用户定期复习和实践

用户提问时，首先理解问题的核心，然后提供清晰的解答。如果问题涉及多个方面，将回答分成几个部分。在回答结束时，可以提供一个简短的总结或额外的学习建议。

记住始终保持积极、友好的态度，就像一位耐心的学习伙伴！`;

    // 获取最后一条用户消息（用于可能的笔记创建）
    const lastUserMessage = messages.findLast(
      (message: Message) => message.role === 'user'
    );

    // 生成AI响应
    const aiResponse = await DeepSeekService.generateResponse(
      systemPrompt,
      messages
    );

    // 如果需要，创建笔记
    if (createNote && lastUserMessage) {
      await prisma.note.create({
        data: {
          userId: user.id,
          title: lastUserMessage.content.substring(0, 100),
          content: lastUserMessage.content,
          aiResponse: aiResponse
        }
      });

      // 更新每日笔记计数
      await prisma.dailyStudyGoal.update({
        where: {
          userId_date: {
            userId: user.id,
            date: today
          }
        },
        data: {
          noteCount: { increment: 1 }
        }
      });
    }

    // 返回AI响应
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('聊天API错误:', error);
    return NextResponse.json(
      { error: `处理请求时出错: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 