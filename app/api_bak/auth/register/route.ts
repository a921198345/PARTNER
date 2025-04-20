import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/db";

// 确保该路由在 Node.js 环境中运行，而不是在 Edge Runtime
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 验证数据
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "缺少必要的注册信息" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashedPassword = await hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "注册成功", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { message: "注册失败，请稍后再试" },
      { status: 500 }
    );
  }
} 