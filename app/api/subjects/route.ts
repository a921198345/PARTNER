import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        subcategories: true
      }
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("获取科目失败:", error);
    return NextResponse.json(
      { message: "获取科目时出现错误" },
      { status: 500 }
    );
  }
} 