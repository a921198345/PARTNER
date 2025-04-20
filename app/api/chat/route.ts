import { NextRequest, NextResponse } from "next/server";

// 使用nodejs运行时而不是edge运行时，确保能正确访问authOptions和prisma
export const runtime = 'nodejs';

// 模拟AI回复列表
const mockResponses = [
  "你好！我是你的AI学习伙伴，很高兴能帮助你备考。有什么问题可以随时问我哦！😊",
  "这个知识点很重要！我来为你详细解析一下：\n\n首先，你需要理解基本概念...\n\n其次，掌握应用方法...\n\n最后，记得多做练习题巩固！",
  "根据最新的考试大纲，这部分内容的重点是：\n1. 基础理论框架\n2. 典型案例分析\n3. 实践应用方法\n\n建议你重点复习这三个方面！",
  "这个问题有点复杂，让我来分步骤解释：\n\n第一步：理解问题本质\n第二步：分析关键要素\n第三步：套用解题公式\n第四步：检查结果\n\n希望这个思路对你有帮助！",
  "不用担心，考试前紧张是很正常的！我建议你：\n\n- 制定合理的复习计划\n- 保持充足的睡眠\n- 做一些放松的活动\n- 适当的运动有助于减压\n\n加油，你一定能行！💪"
];

export async function POST(req: NextRequest) {
  try {
    // 解析请求数据
    const { messages, createNote } = await req.json();

    // 获取随机回复
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    const aiResponse = mockResponses[randomIndex];

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