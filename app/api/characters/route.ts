import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    
    let query = {};
    if (gender) {
      query = { where: { gender } };
    }
    
    const characters = await prisma.aICharacter.findMany(query);
    
    return NextResponse.json(characters);
  } catch (error) {
    console.error("获取角色失败:", error);
    return NextResponse.json(
      { message: "获取角色时出现错误" },
      { status: 500 }
    );
  }
} 