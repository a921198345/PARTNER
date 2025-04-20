import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 引入模拟用户数据（在实际应用中，这些数据应该存储在数据库中）
// 这里为了示例，我们假设有一个共享的用户数组
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
 * POST 方法 - 用户注册
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, subject } = body;

    // 验证必要字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "姓名、邮箱和密码为必填项" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码长度不能少于6个字符" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 创建新用户
    const newUser = {
      id: `user-${mockUsers.length + 1}`,
      name,
      email,
      password, // 实际应用中应该哈希处理
      subject: subject || "未指定",
      avatarUrl: `/avatars/default.png`,
      onboardingCompleted: false, // 新用户需要完成引导流程
      role: "user",
      createdAt: new Date().toISOString()
    };

    // 在实际应用中，这里会将新用户保存到数据库
    // 模拟添加到用户列表
    // mockUsers.push(newUser); // 仅模拟，实际不改变数组

    // 创建用户会话
    const session = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      subject: newUser.subject,
      avatarUrl: newUser.avatarUrl,
      onboardingCompleted: newUser.onboardingCompleted,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
    };

    // 设置cookie
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
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      message: "注册成功",
      user: userWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { message: "注册时出现错误" },
      { status: 500 }
    );
  }
} 