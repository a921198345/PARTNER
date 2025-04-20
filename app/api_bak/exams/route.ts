import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// 获取考试列表
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
    const subjectId = searchParams.get("subjectId");
    const subcategoryId = searchParams.get("subcategoryId");
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const filter: any = {};
    
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    
    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }
    
    if (year) {
      filter.year = year;
    }

    // 获取用户的科目
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subjectId: true },
    });

    // 如果查询没有指定科目，并且用户有科目设置，则按用户科目过滤
    if (!subjectId && user?.subjectId) {
      filter.subjectId = user.subjectId;
    }

    const exams = await prisma.exam.findMany({
      where: filter,
      include: {
        subject: true,
        subCategory: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        year: 'desc',
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("获取考试列表失败:", error);
    return NextResponse.json(
      { message: "获取考试列表过程中出现错误" },
      { status: 500 }
    );
  }
} 