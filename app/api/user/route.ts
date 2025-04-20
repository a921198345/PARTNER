import { NextRequest, NextResponse } from "next/server";

// 模拟用户数据
const mockUsers = [
  {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com",
    image: "https://ui-avatars.com/api/?name=张三&background=0D8ABC&color=fff",
    subject: "公务员考试",
    examDate: "2024-05-15",
    dailyGoal: 120, // 每日学习目标（分钟）
    profile: {
      gender: "male",
      education: "本科",
      major: "行政管理",
      workExperience: 2,
      targetPosition: "行政主管",
      preferredLearningStyle: "视觉学习",
      learningTime: "晚上",
      examGoals: "考取公务员职位，进入市级政府部门工作"
    },
    aiPartner: {
      characterId: "char-1",
      name: "小智",
      gender: "male",
      hairStyle: "short",
      hairColor: "black",
      outfit: "formal",
      accessories: "glasses",
      personality: "专业知识渊博，严谨负责，善于鼓励"
    },
    createdAt: "2023-10-01T08:00:00Z",
    onboardingCompleted: true
  },
  {
    id: "user-2",
    name: "李四",
    email: "lisi@example.com",
    image: "https://ui-avatars.com/api/?name=李四&background=4B0082&color=fff",
    subject: "教师资格证",
    examDate: "2024-03-20",
    dailyGoal: 90,
    profile: {
      gender: "female",
      education: "研究生",
      major: "教育学",
      workExperience: 0,
      targetPosition: "中学语文教师",
      preferredLearningStyle: "听觉学习",
      learningTime: "上午",
      examGoals: "通过教师资格证考试，成为一名中学语文教师"
    },
    aiPartner: {
      characterId: "char-3",
      name: "小慧",
      gender: "female",
      hairStyle: "long",
      hairColor: "brown",
      outfit: "casual",
      accessories: "none",
      personality: "温柔耐心，善于解释复杂概念，鼓励性强"
    },
    createdAt: "2023-11-15T10:30:00Z",
    onboardingCompleted: true
  }
];

/**
 * GET 方法 - 获取当前用户信息
 */
export async function GET(req: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-1"; // 默认用户ID
    
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
    
    // 验证必填字段
    if (!body.id) {
      return NextResponse.json(
        { message: "用户ID为必填项" },
        { status: 400 }
      );
    }
    
    // 查找要更新的用户
    const userIndex = mockUsers.findIndex(user => user.id === body.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 更新用户信息
    const updatedUser = {
      ...mockUsers[userIndex],
      name: body.name || mockUsers[userIndex].name,
      email: body.email || mockUsers[userIndex].email,
      image: body.image || mockUsers[userIndex].image,
      subject: body.subject || mockUsers[userIndex].subject,
      examDate: body.examDate || mockUsers[userIndex].examDate,
      dailyGoal: body.dailyGoal || mockUsers[userIndex].dailyGoal,
      onboardingCompleted: body.onboardingCompleted !== undefined 
        ? body.onboardingCompleted 
        : mockUsers[userIndex].onboardingCompleted,
    };
    
    // 更新个人资料（如果提供）
    if (body.profile) {
      updatedUser.profile = {
        ...mockUsers[userIndex].profile,
        ...body.profile
      };
    }
    
    // 更新AI伙伴设置（如果提供）
    if (body.aiPartner) {
      updatedUser.aiPartner = {
        ...mockUsers[userIndex].aiPartner,
        ...body.aiPartner
      };
    }
    
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

/**
 * 获取当前用户信息的工具函数
 * 在实际应用中，这会检查会话并从数据库获取用户
 */
export async function getCurrentUser(userId = "user-1") {
  const user = mockUsers.find(user => user.id === userId);
  return user || null;
} 