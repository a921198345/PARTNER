import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 模拟题目数据
const mockQuestions = {
  "exam-1": [
    {
      id: "q-1-1",
      examId: "exam-1",
      content: "下列关于我国宪法基本原则的说法，错误的是：",
      options: JSON.stringify({
        A: "人民民主原则是我国宪法的核心原则和基础",
        B: "法治原则要求全国人民代表大会及其常委会对宪法实施监督",
        C: "国家尊重和保障人权，任何公民享有宪法和法律规定的权利",
        D: "国家权力由人民代表大会统一行使，不存在分权制衡"
      }),
      correctAnswer: "D",
      explanation: "我国实行的是人民代表大会制度，但并不是由人大统一行使所有权力，而是由不同国家机关分工负责，互相配合，互相制约。"
    },
    {
      id: "q-1-2",
      examId: "exam-1",
      content: "关于民法中的宣告死亡，下列说法正确的是：",
      options: JSON.stringify({
        A: "公民下落不明满二年，可以宣告死亡",
        B: "因意外事件下落不明，满一年可以宣告死亡",
        C: "宣告死亡的公民，其婚姻关系自法院判决之日起消除",
        D: "被宣告死亡的人重新出现，可以请求返还遗产"
      }),
      correctAnswer: "D",
      explanation: "根据《民法典》规定，被宣告死亡的人重新出现，有权请求返还遗产。A错误，普通情况下落不明应满4年；B错误，意外事件下落不明应满2年；C错误，婚姻关系自死亡宣告之日起消除。"
    },
    {
      id: "q-1-3",
      examId: "exam-1",
      content: "关于刑法中的犯罪未遂，下列说法错误的是：",
      options: JSON.stringify({
        A: "犯罪未遂是指已经着手实行犯罪，由于犯罪分子意志以外的原因而未得逞",
        B: "对于未遂犯，可以比照既遂犯从轻或者减轻处罚",
        C: "犯罪预备转入实行行为才构成犯罪未遂",
        D: "中止犯是未遂犯的一种特殊形式"
      }),
      correctAnswer: "D",
      explanation: "中止犯不是未遂犯的特殊形式，两者是并列关系。未遂犯是由于行为人意志以外的原因未能完成犯罪，而中止犯是行为人自动放弃犯罪或者自动有效地防止犯罪结果发生。"
    }
  ],
  "exam-3": [
    {
      id: "q-3-1",
      examId: "exam-3",
      content: "教师在教学过程中根据学生的反应随机应变、调整教学方法，体现了教学的：",
      options: JSON.stringify({
        A: "计划性",
        B: "开放性",
        C: "互动性",
        D: "示范性"
      }),
      correctAnswer: "C",
      explanation: "教学的互动性是指师生之间、生生之间的交流互动，教师根据学生反应调整教学方法正是体现了教学过程中的互动性。"
    },
    {
      id: "q-3-2",
      examId: "exam-3",
      content: "布鲁姆教育目标分类中，"能够根据所学知识解决新问题"属于哪一层次：",
      options: JSON.stringify({
        A: "知道",
        B: "理解",
        C: "应用",
        D: "分析"
      }),
      correctAnswer: "C",
      explanation: "布鲁姆的认知领域教育目标分为记忆、理解、应用、分析、评价和创造六个层次。其中，能够将所学知识应用于新情境或解决新问题属于应用层次。"
    }
  ],
  "exam-4": [
    {
      id: "q-4-1",
      examId: "exam-4",
      content: "填入横线部分最恰当的一项是：即使科学技术日新月异，即使信息高速公路纵横交错，文学经典依然是人类思想宝库中的_____。",
      options: JSON.stringify({
        A: "弥足珍贵的珍品",
        B: "熠熠生辉的明珠",
        C: "精心雕琢的玉器",
        D: "价值连城的古董"
      }),
      correctAnswer: "B",
      explanation: "本题考查词语搭配。"熠熠生辉"形容光彩鲜明耀眼，用来比喻文学经典在思想宝库中的地位和作用最为恰当。"弥足珍贵"重复，"精心雕琢"不符合文意，"价值连城"侧重于物质价值而非思想价值。"
    },
    {
      id: "q-4-2",
      examId: "exam-4",
      content: "甲、乙二人站在圆心角为60°的圆弧两端，以相同的速度沿圆周往复运动，每当二人相遇时，就记录下各自走过的路程。则第四次相遇时，二人各自走过的路程为圆周长的：",
      options: JSON.stringify({
        A: "5/6",
        B: "3/2",
        C: "7/6",
        D: "11/6"
      }),
      correctAnswer: "D",
      explanation: "设圆周长为1，甲、乙初始相距为1/6。第一次相遇时路程分别为：1/6和0；第二次相遇时为：1/3和1/2；第三次相遇时为：5/6和2/3；第四次相遇时为：1和11/6。因此正确答案为D。"
    }
  ]
};

// 获取考试题目列表
export async function GET(req: NextRequest, { params }: { params: { examId: string } }) {
  try {
    const examId = params.examId;
    
    // 检查是否有该考试的题目
    if (!mockQuestions[examId]) {
      return NextResponse.json(
        { message: "未找到该考试的题目" },
        { status: 404 }
      );
    }
    
    // 返回模拟题目
    return NextResponse.json(mockQuestions[examId]);
  } catch (error) {
    console.error("获取考试题目失败:", error);
    return NextResponse.json(
      { message: "获取考试题目过程中出现错误" },
      { status: 500 }
    );
  }
} 