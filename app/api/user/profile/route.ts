import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// 确保该路由在 Node.js 环境中运行
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "未授权访问" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        subjectId: true,
        aiCharacterId: true,
        aiCustomName: true,
        userNickname: true,
        dailyStudyGoal: true,
        currentStage: true,
        totalPoints: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { message: "获取用户信息失败" },
      { status: 500 }
    );
  }
} 