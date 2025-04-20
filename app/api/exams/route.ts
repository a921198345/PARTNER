import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 模拟考试数据
const mockExams = [
  {
    id: "exam-1",
    title: "2023年公务员行政能力测试模拟卷(一)",
    subject: "公务员考试",
    category: "行政能力测试",
    description: "本试卷涵盖数量关系、言语理解、判断推理、资料分析等主要考点，难度适中，适合初学者练习。",
    totalQuestions: 100,
    totalTime: 120, // 分钟
    passingScore: 60,
    difficulty: "中等",
    tags: ["公考", "行测", "数量关系", "言语理解"],
    createdAt: "2023-05-10T08:00:00Z",
    updatedAt: "2023-10-15T14:30:00Z",
    sections: [
      {
        id: "section-1",
        title: "言语理解与表达",
        description: "主要测查报考者运用语言文字进行思考和交流、迅速准确地理解和把握文字材料内涵的能力。",
        questions: [
          {
            id: "q-1-1",
            type: "choice",
            content: "下列各句中，没有语病的一句是：",
            options: [
              { id: "A", content: "目前，各地都在贯彻落实"八项规定"，坚决反对形式主义、官僚主义，坚决反对铺张浪费行为。" },
              { id: "B", content: "如果选手的成绩达不到参赛标准，将不能获得比赛资格，不能代表国家队出战本次奥运会预选赛。" },
              { id: "C", content: "当前社会上存在的某些不正之风和腐败现象，与一些党员干部世界观、人生观、价值观扭曲是分不开的。" },
              { id: "D", content: "领导干部要深入基层调查研究，全面提高做好新形势下群众工作科学化水平和解决实际问题的能力。" }
            ],
            answer: "A",
            analysis: "B项存在语病，"不能获得比赛资格"与"不能代表国家队出战"表述重复；C项存在语病，"扭曲"是动词，与"分不开"搭配不当；D项存在语病，"科学化水平"与"能力"并列不当。A项没有语病。"
          },
          {
            id: "q-1-2",
            type: "choice",
            content: "依次填入下面一段文字横线处的词语，最恰当的一项是：\n中国特色社会主义进入新时代，我国社会主要矛盾已经转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。发展不平衡不充分，已经成为满足人民日益增长的美好生活需要的主要_______。我们必须坚持以人民为中心的发展思想，_______解决好发展不平衡不充分问题，大力提升发展质量和效益，更好满足人民在经济、政治、文化、社会、生态等方面日益增长的需要。",
            options: [
              { id: "A", content: "制约 不断" },
              { id: "B", content: "障碍 切实" },
              { id: "C", content: "阻力 坚决" },
              { id: "D", content: "瓶颈 着力" }
            ],
            answer: "D",
            analysis: "第一空，"瓶颈"比"制约"、"障碍"、"阻力"更能体现出发展中的关键性问题；第二空，"着力"体现了解决问题的重点和力度，符合文意。因此选择D项。"
          }
        ]
      },
      {
        id: "section-2",
        title: "数量关系",
        description: "主要测查报考者理解、把握事物间量化关系和解决数量关系问题的能力。",
        questions: [
          {
            id: "q-2-1",
            type: "choice",
            content: "甲、乙两人同时从A地出发，分别前往B地，甲的速度是乙的4/3，甲比乙早到30分钟。返回时，甲的速度是乙的3/4，两人同时到达A地。问甲单程所需时间为多少小时？",
            options: [
              { id: "A", content: "2" },
              { id: "B", content: "2.5" },
              { id: "C", content: "3" },
              { id: "D", content: "3.5" }
            ],
            answer: "B",
            analysis: "设甲单程所需时间为T小时，则乙单程所需时间为4T/3小时。两人同时出发，甲比乙早到30分钟，即4T/3 - T = 0.5，解得T = 1.5小时。返程时，甲的速度变为原来的3/4，乙的速度不变。甲返程时间为T/(3/4) = 4T/3 = 2小时。乙返程时间为4T/3 = 2小时。因此甲往返共需1.5 + 2 = 3.5小时，单程为1.5 + (3.5-1.5)/2 = 2.5小时。"
          }
        ]
      }
    ]
  },
  {
    id: "exam-2",
    title: "2023年教师资格证考试模拟卷(二)",
    subject: "教师资格证",
    category: "中学教师",
    description: "本试卷包含教育学、心理学、教学法等内容，是针对中学教师资格证考试的综合模拟试题。",
    totalQuestions: 150,
    totalTime: 150,
    passingScore: 70,
    difficulty: "较难",
    tags: ["教资", "教育学", "心理学", "教学法"],
    createdAt: "2023-06-15T10:15:00Z",
    updatedAt: "2023-10-12T09:45:00Z",
    sections: [
      {
        id: "section-1",
        title: "教育知识与能力",
        description: "主要考察教育学、心理学等相关基础知识。",
        questions: [
          {
            id: "q-1-1",
            type: "choice",
            content: "下列关于教育学的说法，正确的是：",
            options: [
              { id: "A", content: "教育学是一门研究教育现象和教育问题的社会科学。" },
              { id: "B", content: "教育学的研究对象仅限于学校教育。" },
              { id: "C", content: "教育学不涉及心理学和社会学的内容。" },
              { id: "D", content: "教育学理论与教育实践没有直接联系。" }
            ],
            answer: "A",
            analysis: "教育学是研究教育现象和教育问题的社会科学，其研究对象不仅包括学校教育，还包括家庭教育、社会教育等；教育学是一门综合性学科，涉及心理学、社会学等多学科内容；教育学的理论与实践紧密相连。因此A项正确。"
          }
        ]
      }
    ]
  },
  {
    id: "exam-3",
    title: "2023年法律职业资格考试模拟卷(三)",
    subject: "法律职业资格考试",
    category: "客观题",
    description: "本试卷涵盖法理学、宪法、民法、刑法等多个法律科目，难度与真题接近，适合冲刺阶段练习。",
    totalQuestions: 200,
    totalTime: 180,
    passingScore: 80,
    difficulty: "高难",
    tags: ["法考", "民法", "刑法", "宪法", "法理学"],
    createdAt: "2023-07-20T14:30:00Z",
    updatedAt: "2023-10-05T16:20:00Z",
    sections: [
      {
        id: "section-1",
        title: "民法学",
        description: "主要考察民法基本原则、民事主体、民事法律行为、代理等内容。",
        questions: [
          {
            id: "q-1-1",
            type: "choice",
            content: "关于民事法律行为的效力，下列说法正确的是：",
            options: [
              { id: "A", content: "无民事行为能力人实施的民事法律行为一律无效。" },
              { id: "B", content: "限制民事行为能力人实施的纯获利益的民事法律行为有效。" },
              { id: "C", content: "被胁迫实施的民事法律行为自始无效。" },
              { id: "D", content: "重大误解实施的民事法律行为效力待定。" }
            ],
            answer: "B",
            analysis: "A项错误，无民事行为能力人实施的民事法律行为是无效的，但纯获利益的除外；B项正确，根据《民法典》第十九条，限制民事行为能力人实施的纯获利益的民事法律行为或者与其年龄、智力、精神健康状况相适应的民事法律行为有效；C项错误，被胁迫一方有权请求人民法院或者仲裁机构予以撤销，是可撤销的民事法律行为；D项错误，重大误解实施的民事法律行为，行为人有权请求人民法院或者仲裁机构予以撤销，不是效力待定。"
          }
        ]
      }
    ]
  }
];

/**
 * GET 方法 - 获取所有考试或单个考试
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const subject = searchParams.get("subject");
    
    if (examId) {
      // 返回单个考试详情
      const exam = mockExams.find(exam => exam.id === examId);
      
      if (!exam) {
        return NextResponse.json(
          { message: "未找到考试" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(exam);
    } else if (subject) {
      // 按学科筛选考试
      const filteredExams = mockExams.filter(exam => 
        exam.subject.toLowerCase().includes(subject.toLowerCase())
      );
      
      return NextResponse.json({
        exams: filteredExams,
        total: filteredExams.length
      });
    } else {
      // 返回所有考试，但不包含详细题目
      const simpleExams = mockExams.map(exam => {
        const { sections, ...examData } = exam;
        return {
          ...examData,
          questionCount: sections.reduce((total, section) => total + section.questions.length, 0)
        };
      });
      
      return NextResponse.json({
        exams: simpleExams,
        total: simpleExams.length
      });
    }
  } catch (error) {
    console.error("获取考试数据失败:", error);
    return NextResponse.json(
      { message: "获取考试数据时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * POST 方法 - 创建新考试（仅模拟）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 验证必要字段
    if (!body.title || !body.subject || !body.sections) {
      return NextResponse.json(
        { message: "缺少必要的考试信息" },
        { status: 400 }
      );
    }
    
    // 创建新考试（仅返回模拟成功响应）
    const newExam = {
      id: `exam-${mockExams.length + 1}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: "考试创建成功",
      exam: newExam
    }, { status: 201 });
  } catch (error) {
    console.error("创建考试失败:", error);
    return NextResponse.json(
      { message: "创建考试时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * PUT 方法 - 更新考试
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 验证必填字段
    if (!body.id) {
      return NextResponse.json(
        { message: "考试ID为必填项" },
        { status: 400 }
      );
    }
    
    // 查找要更新的考试
    const examIndex = mockExams.findIndex(exam => exam.id === body.id);
    if (examIndex === -1) {
      return NextResponse.json(
        { message: "未找到考试" },
        { status: 404 }
      );
    }
    
    // 验证考试是否属于该用户
    if (mockExams[examIndex].userId !== (body.userId || "user-1")) {
      return NextResponse.json(
        { message: "无权修改此考试" },
        { status: 403 }
      );
    }
    
    // 更新考试信息
    const updatedExam = {
      ...mockExams[examIndex],
      title: body.title || mockExams[examIndex].title,
      subject: body.subject || mockExams[examIndex].subject,
      category: body.category || mockExams[examIndex].category,
      totalQuestions: body.totalQuestions || mockExams[examIndex].totalQuestions,
      totalTime: body.totalTime || mockExams[examIndex].totalTime,
      difficulty: body.difficulty || mockExams[examIndex].difficulty,
      description: body.description || mockExams[examIndex].description,
      coverImage: body.coverImage || mockExams[examIndex].coverImage,
      tags: body.tags || mockExams[examIndex].tags,
      sections: body.sections || mockExams[examIndex].sections,
      updatedAt: new Date().toISOString()
    };
    
    // 在实际应用中，这里会将更新保存到数据库
    // 模拟更新考试列表
    mockExams[examIndex] = updatedExam;
    
    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("更新考试失败:", error);
    return NextResponse.json(
      { message: "更新考试时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * DELETE 方法 - 删除考试
 */
export async function DELETE(req: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = req.nextUrl.searchParams;
    const examId = searchParams.get("examId");
    const userId = searchParams.get("userId") || "user-1"; // 默认用户ID
    
    if (!examId) {
      return NextResponse.json(
        { message: "考试ID为必填项" },
        { status: 400 }
      );
    }
    
    // 查找要删除的考试
    const examIndex = mockExams.findIndex(exam => exam.id === examId);
    if (examIndex === -1) {
      return NextResponse.json(
        { message: "未找到考试" },
        { status: 404 }
      );
    }
    
    // 验证考试是否属于该用户
    if (mockExams[examIndex].userId !== userId) {
      return NextResponse.json(
        { message: "无权删除此考试" },
        { status: 403 }
      );
    }
    
    // 在实际应用中，这里会从数据库中删除考试
    // 模拟从考试列表中删除
    mockExams.splice(examIndex, 1);
    
    return NextResponse.json({ message: "考试已成功删除" });
  } catch (error) {
    console.error("删除考试失败:", error);
    return NextResponse.json(
      { message: "删除考试时出现错误" },
      { status: 500 }
    );
  }
} 