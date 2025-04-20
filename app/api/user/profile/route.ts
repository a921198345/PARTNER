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
    createdAt: "2023-07-01T08:00:00Z",
    studyGoals: {
      dailyMinutes: 60,
      weeklyExams: 2
    },
    preferences: {
      theme: "light",
      notifications: true,
      email: true,
      language: "zh-CN"
    }
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
    createdAt: "2023-07-10T14:20:00Z",
    studyGoals: {
      dailyMinutes: 45,
      weeklyExams: 1
    },
    preferences: {
      theme: "dark",
      notifications: false,
      email: true,
      language: "zh-CN"
    }
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
    createdAt: "2023-06-01T10:00:00Z",
    studyGoals: null,
    preferences: {
      theme: "system",
      notifications: true,
      email: true,
      language: "zh-CN"
    }
  }
];

/**
 * 获取当前会话的用户
 */
function getCurrentUser() {
  const sessionCookie = cookies().get("session");
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const user = mockUsers.find(user => user.id === session.userId);
    return user || null;
  } catch (error) {
    return null;
  }
}

/**
 * GET 方法 - 获取用户个人资料
 */
export async function GET(req: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: "用户未登录或会话无效" },
        { status: 401 }
      );
    }
    
    // 返回用户信息（不含密码）
    const { password, ...userWithoutPassword } = currentUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("获取用户资料失败:", error);
    return NextResponse.json(
      { message: "获取用户资料时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * PUT 方法 - 更新用户个人资料
 */
export async function PUT(req: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: "用户未登录或会话无效" },
        { status: 401 }
      );
    }
    
    // 获取请求体
    const body = await req.json();
    
    // 定义允许更新的字段
    const allowedFields = ["name", "subject", "avatarUrl", "studyGoals", "preferences", "onboardingCompleted"];
    
    // 创建更新后的用户对象
    const updatedUser = { ...currentUser };
    
    // 只更新允许的字段
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // 特殊处理嵌套对象
        if (field === "studyGoals" || field === "preferences") {
          updatedUser[field] = {
            ...updatedUser[field],
            ...body[field]
          };
        } else {
          updatedUser[field] = body[field];
        }
      }
    }
    
    // 在实际应用中，这里会将更新保存到数据库
    // 模拟更新用户数据
    
    // 返回更新后的用户信息（不含密码）
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: "用户资料更新成功",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("更新用户资料失败:", error);
    return NextResponse.json(
      { message: "更新用户资料时出现错误" },
      { status: 500 }
    );
  }
} 