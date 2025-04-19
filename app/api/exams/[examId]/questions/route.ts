import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 根据Next.js 15规范，params现在是一个Promise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { examId } = params;
    const { searchParams } = request.nextUrl;
    
    // 检查是否请求错题
    const wrongOnly = searchParams.get("wrongOnly") === "true";
    
    // 检查是否有进行中的考试
    let examAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId: session.user.id,
        examId,
        endTime: null,
      },
    });

    // 如果没有进行中的考试，创建一个新的
    if (!examAttempt) {
      examAttempt = await prisma.examAttempt.create({
        data: {
          userId: session.user.id,
          examId,
        },
      });
    }

    // 查询条件
    let questionsQuery: any = {
      where: { examId },
      select: {
        id: true,
        content: true,
        options: true,
        answerAttempts: {
          where: { 
            examAttempt: { 
              userId: session.user.id 
            } 
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    };

    // 如果只查询错题
    if (wrongOnly) {
      questionsQuery = {
        where: {
          examId,
          answerAttempts: {
            some: {
              examAttempt: { userId: session.user.id },
              isCorrect: false,
            },
          },
        },
        select: {
          id: true,
          content: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          knowledgePoints: true,
          answerAttempts: {
            where: { 
              examAttempt: { 
                userId: session.user.id 
              } 
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      };
    }

    const questions = await prisma.question.findMany(questionsQuery);

    return NextResponse.json({
      examAttemptId: examAttempt.id,
      questions: questions.map(q => ({
        ...q,
        // 如果不是错题模式，不返回正确答案
        correctAnswer: wrongOnly ? q.correctAnswer : undefined,
        // 用户上次答案
        lastAnswer: q.answerAttempts[0]?.userAnswer || null,
        isCorrect: q.answerAttempts[0]?.isCorrect || null,
        // 移除原始答题记录
        answerAttempts: undefined,
      })),
    });
  } catch (error) {
    console.error("获取考试题目失败:", error);
    return NextResponse.json(
      { message: "获取考试题目过程中出现错误" },
      { status: 500 }
    );
  }
} 