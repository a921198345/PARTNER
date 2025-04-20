import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      );
    }

    const { 
      subjectId, 
      aiCharacterId,
      aiCustomName,
      userNickname,
      dailyStudyGoal,
      currentStage 
    } = await req.json();

    // 验证必要字段
    if (!subjectId || !aiCharacterId) {
      return NextResponse.json(
        { message: "缺少必要的字段" },
        { status: 400 }
      );
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subjectId,
        aiCharacterId,
        aiCustomName,
        userNickname,
        dailyStudyGoal: dailyStudyGoal ? parseFloat(dailyStudyGoal) : null,
        currentStage
      },
    });

    return NextResponse.json(
      { message: "设置成功", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("设置失败:", error);
    return NextResponse.json(
      { message: "设置过程中出现错误" },
      { status: 500 }
    );
  }
} 