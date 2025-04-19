import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeepSeekService } from "@/lib/deepseek";
import { KnowledgeService } from "@/lib/knowledge/service";

// 使用nodejs运行时而不是edge运行时，确保能正确访问authOptions和prisma
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { message, chatHistory } = await req.json();

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subject: true,
        aiCharacter: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }

    // 存储用户消息
    await prisma.chatHistory.create({
      data: {
        userId: user.id,
        message,
        isUser: true,
      },
    });

    // 检查是否是首次对话，用于设置学习时长
    const isFirstChat = message.includes("学习时长") || !user.dailyStudyGoal;
    const characterPersonality = user.aiCharacter ? 
      `你是一个${user.aiCharacter.gender === 'female' ? '女性' : '男性'}${user.aiCharacter.type}类型的角色，名字是${user.aiCustomName || user.aiCharacter.name}` : 
      "你是一个友好的学习助手";

    // 构建系统提示
    let systemPrompt = `${characterPersonality}。你是用户${user.userNickname || user.name}的专属学习助手，`;
    
    if (user.subject) {
      systemPrompt += `专注于帮助用户准备${user.subject.name}考试。`;
    } else {
      systemPrompt += `专注于帮助用户准备各类考试。`;
    }

    // 处理学习时长设置
    if (isFirstChat) {
      systemPrompt += `用户想设置每日学习时长目标，请友好地询问他想设置多少小时，并鼓励他坚持。建议每天学习3-5小时。`;
    } else {
      systemPrompt += `用户每日学习目标是${user.dailyStudyGoal || "尚未设置"}小时。请鼓励他坚持学习并提供相关帮助。`;
    }

    systemPrompt += `请使用轻松友好的风格，偶尔加入适当的表情符号，让交流更生动。`;

    // 获取知识库相关内容（新增）
    let knowledgePrompt = "";
    if (user.subject && !isFirstChat) {
      knowledgePrompt = await KnowledgeService.buildKnowledgePrompt(
        message, 
        user.subjectId || undefined
      );
    }
    
    if (knowledgePrompt) {
      systemPrompt += `\n\n${knowledgePrompt}`;
    }

    // 准备聊天历史
    const formattedPreviousMessages = chatHistory.map((chat: any) => ({
      role: chat.isUser ? "user" : "assistant",
      content: chat.message,
    }));

    // 发送到DeepSeek（替换OpenAI）
    const response = await DeepSeekService.chat({
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedPreviousMessages,
        { role: "user", content: message }
      ],
    });

    // 获取AI回复
    const aiMessage = response.choices[0].message.content;

    // 存储AI回复
    await prisma.chatHistory.create({
      data: {
        userId: user.id,
        message: aiMessage,
        isUser: false,
      },
    });

    // 如果是设置学习时长的对话且包含小时数
    if (isFirstChat && message.includes("小时")) {
      // 尝试提取用户设置的小时数
      const hourMatch = message.match(/(\d+(?:\.\d+)?)\s*小时/);
      if (hourMatch && hourMatch[1]) {
        const hours = parseFloat(hourMatch[1]);
        // 更新用户学习时长目标
        await prisma.user.update({
          where: { id: user.id },
          data: { dailyStudyGoal: hours },
        });
      }
    }

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error("聊天请求失败:", error);
    return NextResponse.json(
      { message: "聊天请求过程中出现错误" },
      { status: 500 }
    );
  }
} 