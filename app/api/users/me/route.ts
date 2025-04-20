import { NextRequest, NextResponse } from "next/server";

// 模拟用户数据
const mockUsers = [
  {
    id: "user-1",
    name: "张小明",
    email: "xiaoming@example.com",
    image: "/avatars/user1.png",
    onboardingComplete: true,
    examType: "公务员考试",
    subject: "公务员考试",
    character: {
      type: "male_1",
      name: "小智",
      customizations: {
        hairStyle: "style1",
        hairColor: "black",
        outfit: "casual",
        accessories: "glasses"
      }
    },
    dailyGoals: {
      studyTime: 120,
      questionCount: 30
    },
    preferences: {
      theme: "light",
      notifications: true
    },
    stats: {
      totalStudyTime: 1450,
      totalQuestionsAnswered: 320,
      correctRate: 76,
      streakDays: 5
    },
    createdAt: "2023-05-10T08:00:00Z",
    updatedAt: "2023-10-15T14:30:00Z"
  },
  {
    id: "user-2",
    name: "李小红",
    email: "xiaohong@example.com",
    image: "/avatars/user2.png",
    onboardingComplete: true,
    examType: "教师资格证",
    subject: "教师资格证",
    character: {
      type: "female_2",
      name: "小静",
      customizations: {
        hairStyle: "style3",
        hairColor: "brown",
        outfit: "professional",
        accessories: "necklace"
      }
    },
    dailyGoals: {
      studyTime: 90,
      questionCount: 20
    },
    preferences: {
      theme: "dark",
      notifications: true
    },
    stats: {
      totalStudyTime: 980,
      totalQuestionsAnswered: 210,
      correctRate: 82,
      streakDays: 3
    },
    createdAt: "2023-06-15T10:15:00Z",
    updatedAt: "2023-10-12T09:45:00Z"
  }
];

/**
 * GET 方法 - 获取当前登录用户信息
 */
export async function GET(req: NextRequest) {
  try {
    // 从Cookie或请求头中解析用户ID
    // 在实际应用中，这里会验证用户会话或令牌
    const userId = req.cookies.get("userId")?.value || "user-1"; // 默认用户ID
    
    // 查找用户
    const user = mockUsers.find(user => user.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "未找到用户" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { message: "获取用户信息时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * PUT 方法 - 更新用户信息
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 从Cookie或请求头中解析用户ID
    // 在实际应用中，这里会验证用户会话或令牌
    const userId = req.cookies.get("userId")?.value || "user-1"; // 默认用户ID
    
    // 查找用户
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { message: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 更新用户信息
    const updatedUser = {
      ...mockUsers[userIndex],
      ...body,
      id: userId, // 确保ID不被更改
      updatedAt: new Date().toISOString()
    };
    
    // 在实际应用中，这里会将更新保存到数据库
    // 模拟更新用户列表
    mockUsers[userIndex] = updatedUser;
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新用户信息失败:", error);
    return NextResponse.json(
      { message: "更新用户信息时出现错误" },
      { status: 500 }
    );
  }
} 