import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 模拟用户数据
const mockUsers = [
  {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com",
    password: "password123", // 实际应用中应该是哈希后的密码
    subject: "公务员考试",
    avatarUrl: "/avatars/avatar1.png",
    onboardingCompleted: true,
    role: "user",
    createdAt: "2023-07-01T08:00:00Z"
  },
  {
    id: "user-2",
    name: "李四",
    email: "lisi@example.com",
    password: "password123",
    subject: "教师资格证",
    avatarUrl: "/avatars/avatar2.png",
    onboardingCompleted: true,
    role: "user",
    createdAt: "2023-07-10T14:20:00Z"
  },
  {
    id: "admin",
    name: "管理员",
    email: "admin@example.com",
    password: "admin123",
    subject: "全部",
    avatarUrl: "/avatars/admin.png",
    onboardingCompleted: true,
    role: "admin",
    createdAt: "2023-06-01T10:00:00Z"
  }
];

/**
 * POST 方法 - 用户登录
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 验证必要字段
    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码为必填项" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = mockUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    // 用户不存在或密码错误
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "邮箱或密码不正确" },
        { status: 401 }
      );
    }

    // 创建用户会话（在实际应用中，这里会使用JWT或其他会话管理机制）
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subject: user.subject,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
    };

    // 设置cookie（模拟）
    cookies().set({
      name: "session",
      value: JSON.stringify(session),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7天
      sameSite: "lax"
    });

    // 返回用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: "登录成功",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { message: "登录时出现错误" },
      { status: 500 }
    );
  }
} 