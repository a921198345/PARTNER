import { NextRequest, NextResponse } from "next/server";

// 从主考试API导入模拟数据（实际项目中应该使用数据库）
// 这里模拟导入，实际项目中需要从数据库获取
const mockExams = [
  {
    id: "exam-1",
    title: "法律职业资格考试模拟题集一",
    description: "本题集涵盖民法、刑法、行政法与宪法等内容，是法考备考的重要资料。",
    subject: "法考",
    difficultyLevel: "中级",
    questions: [
      {
        id: "q-1",
        text: "下列关于民法中继承制度的说法，错误的是：",
        options: [
          { id: "o-1", text: "法定继承人包括配偶、子女、父母" },
          { id: "o-2", text: "遗嘱继承优先于法定继承" },
          { id: "o-3", text: "第一顺序继承人均分遗产，不能有所差别" },
          { id: "o-4", text: "继承开始后，继承人放弃继承的，应当在遗产处理前作出放弃继承的表示" }
        ],
        correctOptionId: "o-3",
        explanation: "同一顺序继承人继承遗产的份额，一般应当均等。但对生活有特殊困难又缺乏劳动能力的继承人，分配遗产时，应当予以照顾。对被继承人尽了主要扶养义务或者与被继承人共同生活的继承人，分配遗产时，可以多分。"
      },
      {
        id: "q-2",
        text: "根据《刑法》规定，下列哪种行为构成盗窃罪？",
        options: [
          { id: "o-1", text: "张三趁李四不注意，拿走了李四故意丢弃的废旧手机" },
          { id: "o-2", text: "王五拾得一部手机，发现是李四的，将其占为己有" },
          { id: "o-3", text: "赵六未经许可，擅自使用他人计算机系统，造成轻微损失" },
          { id: "o-4", text: "钱七以无力偿还为由，拒绝归还向李四借用的手表" }
        ],
        correctOptionId: "o-2",
        explanation: "盗窃罪是指以非法占有为目的，秘密窃取公私财物数额较大或者多次盗窃的行为。拾得遗失物为他人所有，应当返还；拒不返回而将其占为己有的，构成盗窃罪。"
      },
      {
        id: "q-3",
        text: "下列选项中，属于我国宪法明确规定的公民基本权利的是：",
        options: [
          { id: "o-1", text: "受益权" },
          { id: "o-2", text: "婚姻自由权" },
          { id: "o-3", text: "网络使用权" },
          { id: "o-4", text: "购物自由权" }
        ],
        correctOptionId: "o-2",
        explanation: "我国宪法明确规定了公民的各项基本权利，包括平等权、政治权利和自由、宗教信仰自由、人身自由、人格尊严不受侵犯、住宅不受侵犯、通信自由和通信秘密受法律保护等权利。婚姻自由权属于宪法明确规定的公民基本权利之一。"
      }
    ],
    createdAt: new Date("2023-05-15").toISOString(),
    updatedAt: new Date("2023-05-15").toISOString(),
    createdBy: "admin",
    totalQuestions: 3
  },
  {
    id: "exam-2",
    title: "教师资格证考试模拟题",
    description: "本题集主要涵盖教育心理学、教育法律法规以及教学能力等方面的内容。",
    subject: "教资",
    difficultyLevel: "初级",
    questions: [
      {
        id: "q-1",
        text: "根据埃里克森的人格发展理论，处于青春期的个体面临的心理社会危机是：",
        options: [
          { id: "o-1", text: "信任对不信任" },
          { id: "o-2", text: "自主对羞耻怀疑" },
          { id: "o-3", text: "主动对内疚" },
          { id: "o-4", text: "自我同一性对角色混乱" }
        ],
        correctOptionId: "o-4",
        explanation: "根据埃里克森的人格发展理论，人一生要经历8个发展阶段，每个阶段都面临一个心理社会危机。青春期（12-18岁）面临的心理社会危机是自我同一性对角色混乱，这一阶段的核心任务是形成稳定的自我认同。"
      },
      {
        id: "q-2",
        text: "《中华人民共和国教师法》规定，教师的平均工资水平应当不低于或者高于国家公务员的平均工资水平，并逐步提高。下列说法错误的是：",
        options: [
          { id: "o-1", text: "教师的平均工资水平应当与国家公务员保持一致" },
          { id: "o-2", text: "教师的平均工资水平应当不低于国家公务员" },
          { id: "o-3", text: "教师的平均工资水平要逐步提高" },
          { id: "o-4", text: "教师的平均工资水平可以高于国家公务员" }
        ],
        correctOptionId: "o-1",
        explanation: "《中华人民共和国教师法》第二十五条规定：'教师的平均工资水平应当不低于或者高于国家公务员的平均工资水平，并逐步提高。'法律并未要求教师与公务员工资保持一致，而是规定不低于或高于公务员平均水平。"
      }
    ],
    createdAt: new Date("2023-06-01").toISOString(),
    updatedAt: new Date("2023-06-02").toISOString(),
    createdBy: "admin",
    totalQuestions: 2
  },
  {
    id: "exam-3",
    title: "公务员考试行测模拟题",
    description: "本题集包含数量关系、言语理解与表达、判断推理等行测重点内容。",
    subject: "考公",
    difficultyLevel: "高级",
    questions: [
      {
        id: "q-1",
        text: "\"近朱者赤，近墨者黑\"这句话蕴含的哲理与下列哪一选项最为接近？",
        options: [
          { id: "o-1", text: "学然后知不足" },
          { id: "o-2", text: "近水楼台先得月" },
          { id: "o-3", text: "物以类聚，人以群分" },
          { id: "o-4", text: "见贤思齐，见不贤而内自省" }
        ],
        correctOptionId: "o-3",
        explanation: "\"近朱者赤，近墨者黑\"表达的是环境对人的影响，类似于\"物以类聚，人以群分\"，都强调了环境、群体对个人的影响。"
      },
      {
        id: "q-2",
        text: "某单位举办活动，购买了100个气球，红色气球数量是黄色气球数量的2倍，黄色气球数量是蓝色气球数量的3倍。问蓝色气球有多少个？",
        options: [
          { id: "o-1", text: "10" },
          { id: "o-2", text: "15" },
          { id: "o-3", text: "20" },
          { id: "o-4", text: "25" }
        ],
        correctOptionId: "o-2",
        explanation: "设蓝色气球有x个，则黄色气球有3x个，红色气球有2×3x=6x个。根据题意，x+3x+6x=100，解得x=10，所以蓝色气球有10个，黄色气球有30个，红色气球有60个。"
      },
      {
        id: "q-3",
        text: "下列词语中，没有错别字的一项是：",
        options: [
          { id: "o-1", text: "鞠躬尽瘁，死而后已" },
          { id: "o-2", text: "美轮美奂" },
          { id: "o-3", text: "金碧辉煌" },
          { id: "o-4", text: "无价之宝" }
        ],
        correctOptionId: "o-3",
        explanation: "\"鞠躬尽瘁，死而后已\"中\"已\"应为\"已\";\"美轮美奂\"中正确写法为\"美轮美奂\";\"无价之宝\"中正确写法为\"无价之宝\";\"金碧辉煌\"的写法正确。"
      }
    ],
    createdAt: new Date("2023-04-10").toISOString(),
    updatedAt: new Date("2023-04-12").toISOString(),
    createdBy: "admin",
    totalQuestions: 3
  }
];

// 获取单个考试
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    
    // 查找指定ID的考试
    const exam = mockExams.find((exam) => exam.id === examId);
    
    // 如果考试不存在，返回404错误
    if (!exam) {
      return NextResponse.json(
        { message: "未找到该考试" },
        { status: 404 }
      );
    }
    
    // 返回考试详情（包含题目）
    return NextResponse.json(exam);
  } catch (error) {
    console.error("获取考试详情失败:", error);
    return NextResponse.json(
      { message: "获取考试详情时出现错误" },
      { status: 500 }
    );
  }
}

// 更新考试
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const updateData = await req.json();
    
    // 查找指定ID的考试
    const examIndex = mockExams.findIndex((exam) => exam.id === examId);
    
    // 如果考试不存在，返回404错误
    if (examIndex === -1) {
      return NextResponse.json(
        { message: "未找到该考试" },
        { status: 404 }
      );
    }
    
    // 验证必要字段
    if (updateData.questions && (!Array.isArray(updateData.questions) || updateData.questions.length === 0)) {
      return NextResponse.json(
        { message: "题目格式不正确" },
        { status: 400 }
      );
    }
    
    // 更新考试（实际应用中会更新数据库）
    const updatedExam = {
      ...mockExams[examIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // 如果更新了题目，更新题目总数
    if (updateData.questions) {
      updatedExam.totalQuestions = updateData.questions.length;
    }
    
    // 在实际应用中，这里会将更新后的数据保存到数据库
    // mockExams[examIndex] = updatedExam;
    
    // 返回更新后的考试（不包含题目详情）
    const examResponse = {
      id: updatedExam.id,
      title: updatedExam.title,
      description: updatedExam.description,
      subject: updatedExam.subject,
      difficultyLevel: updatedExam.difficultyLevel,
      createdAt: updatedExam.createdAt,
      updatedAt: updatedExam.updatedAt,
      totalQuestions: updatedExam.totalQuestions
    };
    
    return NextResponse.json(examResponse);
  } catch (error) {
    console.error("更新考试失败:", error);
    return NextResponse.json(
      { message: "更新考试时出现错误" },
      { status: 500 }
    );
  }
}

// 删除考试
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    
    // 查找指定ID的考试
    const examIndex = mockExams.findIndex((exam) => exam.id === examId);
    
    // 如果考试不存在，返回404错误
    if (examIndex === -1) {
      return NextResponse.json(
        { message: "未找到该考试" },
        { status: 404 }
      );
    }
    
    // 在实际应用中，这里会从数据库中删除考试
    // mockExams.splice(examIndex, 1);
    
    return NextResponse.json(
      { message: "考试已成功删除" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除考试失败:", error);
    return NextResponse.json(
      { message: "删除考试时出现错误" },
      { status: 500 }
    );
  }
} 