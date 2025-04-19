import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 提交答案
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { examAttemptId, questionId, userAnswer } = await req.json();

    if (!examAttemptId || !questionId || userAnswer === undefined) {
      return NextResponse.json(
        { message: "缺少必要的字段" },
        { status: 400 }
      );
    }

    // 验证考试尝试是否属于当前用户
    const examAttempt = await prisma.examAttempt.findFirst({
      where: {
        id: examAttemptId,
        userId: session.user.id,
      },
    });

    if (!examAttempt) {
      return NextResponse.json(
        { message: "无效的考试尝试" },
        { status: 404 }
      );
    }

    // 获取问题和正确答案
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        correctAnswer: true,
        explanation: true,
        knowledgePoints: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "问题不存在" },
        { status: 404 }
      );
    }

    // 判断答案是否正确
    const isCorrect = userAnswer === question.correctAnswer;

    // 保存用户答案
    const answerAttempt = await prisma.answerAttempt.create({
      data: {
        examAttemptId,
        questionId,
        userAnswer,
        isCorrect,
      },
    });

    // 如果答案正确，只返回正确信息
    if (isCorrect) {
      return NextResponse.json({
        isCorrect,
        message: "回答正确！"
      });
    }

    // 如果答案错误，返回详细解析和知识点
    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      knowledgePoints: question.knowledgePoints,
      message: "回答错误，已加入错题本"
    });
  } catch (error) {
    console.error("提交答案失败:", error);
    return NextResponse.json(
      { message: "提交答案过程中出现错误" },
      { status: 500 }
    );
  }
} 