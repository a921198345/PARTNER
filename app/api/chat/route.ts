import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

// 配置OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

    // 准备聊天历史
    const formattedPreviousMessages = chatHistory.map((chat: any) => ({
      role: chat.isUser ? "user" : "assistant",
      content: chat.message,
    }));

    // 发送到OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedPreviousMessages,
        { role: "user", content: message }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    // 创建流式响应
    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        // 存储AI回复
        await prisma.chatHistory.create({
          data: {
            userId: user.id,
            message: completion,
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
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("聊天请求失败:", error);
    return NextResponse.json(
      { message: "聊天请求过程中出现错误" },
      { status: 500 }
    );
  }
} 