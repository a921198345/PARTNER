import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 模拟用户数据
const mockUsers = [
  {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com",
    subject: "公务员考试",
    dailyGoal: 120, // 每日学习目标（分钟）
    examDate: "2024-05-15", // 考试日期
  },
  {
    id: "user-2",
    name: "李四",
    email: "lisi@example.com",
    subject: "教师资格证",
    dailyGoal: 90,
    examDate: "2024-03-20",
  }
];

// 模拟学习记录数据
const mockStudyRecords = [
  // 用户1的记录
  {
    userId: "user-1",
    date: "2023-10-15",
    duration: 75, // 学习时长（分钟）
    completed: false // 是否完成每日目标
  },
  {
    userId: "user-1",
    date: "2023-10-16",
    duration: 130,
    completed: true
  },
  {
    userId: "user-1",
    date: "2023-10-17",
    duration: 150,
    completed: true
  },
  {
    userId: "user-1",
    date: "2023-10-18",
    duration: 95,
    completed: false
  },
  {
    userId: "user-1",
    date: "2023-10-19",
    duration: 145,
    completed: true
  },
  {
    userId: "user-1",
    date: "2023-10-20",
    duration: 180,
    completed: true
  },
  {
    userId: "user-1",
    date: "2023-10-21",
    duration: 65,
    completed: false
  },
  // 用户2的记录
  {
    userId: "user-2",
    date: "2023-10-15",
    duration: 95,
    completed: true
  },
  {
    userId: "user-2",
    date: "2023-10-16",
    duration: 85,
    completed: false
  },
  {
    userId: "user-2",
    date: "2023-10-17",
    duration: 110,
    completed: true
  },
  {
    userId: "user-2",
    date: "2023-10-18",
    duration: 100,
    completed: true
  },
  {
    userId: "user-2",
    date: "2023-10-19",
    duration: 75,
    completed: false
  },
  {
    userId: "user-2",
    date: "2023-10-20",
    duration: 95,
    completed: true
  },
  {
    userId: "user-2",
    date: "2023-10-21",
    duration: 120,
    completed: true
  }
];

// 模拟考试成绩数据
const mockExamResults = [
  // 用户1的考试成绩
  {
    userId: "user-1",
    examId: "exam-1",
    title: "公务员考试模拟卷一",
    date: "2023-09-28",
    score: 78,
    totalQuestions: 100,
    correctAnswers: 78,
    timeSpent: 95, // 分钟
    category: "行政职业能力测试"
  },
  {
    userId: "user-1",
    examId: "exam-2",
    title: "公务员考试模拟卷二",
    date: "2023-10-05",
    score: 82,
    totalQuestions: 100,
    correctAnswers: 82,
    timeSpent: 90,
    category: "行政职业能力测试"
  },
  {
    userId: "user-1",
    examId: "exam-3",
    title: "行政法练习题",
    date: "2023-10-12",
    score: 85,
    totalQuestions: 50,
    correctAnswers: 43,
    timeSpent: 45,
    category: "申论"
  },
  {
    userId: "user-1",
    examId: "exam-4",
    title: "公务员考试模拟卷三",
    date: "2023-10-19",
    score: 88,
    totalQuestions: 100,
    correctAnswers: 88,
    timeSpent: 85,
    category: "行政职业能力测试"
  },
  // 用户2的考试成绩
  {
    userId: "user-2",
    examId: "exam-5",
    title: "教师资格证模拟卷一",
    date: "2023-09-25",
    score: 75,
    totalQuestions: 150,
    correctAnswers: 112,
    timeSpent: 120,
    category: "教育知识与能力"
  },
  {
    userId: "user-2",
    examId: "exam-6",
    title: "教育心理学测试",
    date: "2023-10-02",
    score: 88,
    totalQuestions: 50,
    correctAnswers: 44,
    timeSpent: 40,
    category: "教育知识与能力"
  },
  {
    userId: "user-2",
    examId: "exam-7",
    title: "教师资格证模拟卷二",
    date: "2023-10-09",
    score: 82,
    totalQuestions: 150,
    correctAnswers: 123,
    timeSpent: 115,
    category: "教育知识与能力"
  },
  {
    userId: "user-2",
    examId: "exam-8",
    title: "教学设计能力测试",
    date: "2023-10-16",
    score: 90,
    totalQuestions: 50,
    correctAnswers: 45,
    timeSpent: 50,
    category: "学科知识与教学能力"
  }
];

/**
 * 获取当前会话的用户ID
 */
function getCurrentUserId() {
  const sessionCookie = cookies().get("session");
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.userId || null;
  } catch (error) {
    return null;
  }
}

/**
 * GET 方法 - 获取用户学习统计数据
 */
export async function GET(req: NextRequest) {
  try {
    // 获取当前用户ID
    const userId = getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { message: "用户未登录或会话无效" },
        { status: 401 }
      );
    }
    
    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week"; // day, week, month, year, all
    
    // 获取用户信息
    const user = mockUsers.find(user => user.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 计算日期范围
    const today = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0); // 从1970年开始
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // 将日期转换为字符串格式，以便与模拟数据比较
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // 筛选指定日期范围内的学习记录
    const studyRecords = mockStudyRecords.filter(record => 
      record.userId === userId && record.date >= startDateStr
    );
    
    // 计算学习时间统计
    const totalStudyTime = studyRecords.reduce((sum, record) => sum + record.duration, 0);
    const completedDays = studyRecords.filter(record => record.completed).length;
    const averageDailyTime = studyRecords.length > 0 
      ? Math.round(totalStudyTime / studyRecords.length) 
      : 0;
    
    // 计算学习时间趋势（按日期组织数据）
    const studyTimeTrend = studyRecords.map(record => ({
      date: record.date,
      duration: record.duration,
      completed: record.completed,
      goal: user.dailyGoal
    }));
    
    // 筛选指定日期范围内的考试成绩
    const examResults = mockExamResults.filter(result => 
      result.userId === userId && result.date >= startDateStr
    );
    
    // 计算考试成绩统计
    const averageScore = examResults.length > 0 
      ? Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length) 
      : 0;
    const highestScore = examResults.length > 0 
      ? Math.max(...examResults.map(result => result.score)) 
      : 0;
    const totalExams = examResults.length;
    
    // 计算考试成绩趋势
    const scoreTrend = examResults.map(result => ({
      date: result.date,
      title: result.title,
      score: result.score,
      category: result.category
    }));
    
    // 计算类别得分情况
    const categoryScores = {};
    examResults.forEach(result => {
      if (!categoryScores[result.category]) {
        categoryScores[result.category] = {
          scores: [],
          total: 0,
          count: 0
        };
      }
      
      categoryScores[result.category].scores.push(result.score);
      categoryScores[result.category].total += result.score;
      categoryScores[result.category].count += 1;
    });
    
    // 计算每个类别的平均分
    const categoryAverages = Object.keys(categoryScores).map(category => {
      const { total, count } = categoryScores[category];
      return {
        category,
        averageScore: Math.round(total / count),
        examCount: count
      };
    });
    
    // 计算距离考试的天数
    let daysToExam = null;
    if (user.examDate) {
      const examDate = new Date(user.examDate);
      const currentDate = new Date();
      const timeDiff = examDate.getTime() - currentDate.getTime();
      daysToExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    // 计算学习进度和状态
    const studyStatus = {
      daysToExam,
      recentActivity: studyRecords.length > 0,
      consistencyScore: Math.min(100, Math.round((completedDays / 7) * 100)), // 基于过去7天的完成情况
      averageScoreColor: averageScore >= 85 ? 'green' : (averageScore >= 70 ? 'orange' : 'red'),
      progressSummary: ""
    };
    
    // 生成进度摘要
    if (daysToExam !== null) {
      if (daysToExam <= 0) {
        studyStatus.progressSummary = "考试已结束，希望你取得了好成绩！";
      } else if (daysToExam <= 7) {
        studyStatus.progressSummary = `距离考试仅剩${daysToExam}天，加油冲刺！`;
      } else if (daysToExam <= 30) {
        studyStatus.progressSummary = `距离考试还有${daysToExam}天，请保持学习节奏，重点复习弱项。`;
      } else {
        studyStatus.progressSummary = `距离考试还有${daysToExam}天，请制定合理的学习计划，打好基础。`;
      }
    } else {
      studyStatus.progressSummary = "请设置考试日期，以便我们为您提供更精准的学习建议。";
    }
    
    // 返回完整的统计数据
    return NextResponse.json({
      subject: user.subject,
      examDate: user.examDate,
      dailyGoal: user.dailyGoal,
      studyTime: {
        total: totalStudyTime,
        completedDays,
        averageDaily: averageDailyTime,
        trend: studyTimeTrend
      },
      examPerformance: {
        averageScore,
        highestScore,
        totalExams,
        trend: scoreTrend,
        categoryAverages
      },
      studyStatus
    });
  } catch (error) {
    console.error("获取学习统计数据失败:", error);
    return NextResponse.json(
      { message: "获取学习统计数据时出现错误" },
      { status: 500 }
    );
  }
} 