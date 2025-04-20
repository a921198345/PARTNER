import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// 记录学习时间
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { duration, websites } = await req.json();

    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { message: "学习时长必须为正数" },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }

    // 获取今天的日期（不包含时间）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找今天的学习记录
    let studyRecord = await prisma.studyRecord.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // 检查是否达成目标
    const newDuration = (studyRecord?.duration || 0) + duration;
    const isDailyGoalCompleted = user.dailyStudyGoal ? newDuration >= user.dailyStudyGoal : false;

    // 如果有记录就更新，没有就创建
    if (studyRecord) {
      studyRecord = await prisma.studyRecord.update({
        where: { id: studyRecord.id },
        data: {
          duration: newDuration,
          websites: [...(studyRecord.websites || []), ...(websites || [])],
          completed: isDailyGoalCompleted,
        },
      });
    } else {
      studyRecord = await prisma.studyRecord.create({
        data: {
          userId: user.id,
          duration,
          websites: websites || [],
          completed: isDailyGoalCompleted,
        },
      });
    }

    // 如果达成目标，增加积分
    if (isDailyGoalCompleted && !studyRecord.completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: 10 }, // 每天完成加10分
        },
      });
    }

    return NextResponse.json({
      message: "学习时间记录成功",
      studyRecord,
      isDailyGoalCompleted,
    });
  } catch (error) {
    console.error("记录学习时间失败:", error);
    return NextResponse.json(
      { message: "记录学习时间过程中出现错误" },
      { status: 500 }
    );
  }
}

// 获取学习记录
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week"; // day, week, month

    // 获取起始日期
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // 查询学习记录
    const studyRecords = await prisma.studyRecord.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyStudyGoal: true },
    });

    return NextResponse.json({
      records: studyRecords,
      dailyGoal: user?.dailyStudyGoal || 0,
    });
  } catch (error) {
    console.error("获取学习记录失败:", error);
    return NextResponse.json(
      { message: "获取学习记录过程中出现错误" },
      { status: 500 }
    );
  }
} 