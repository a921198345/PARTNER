import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 导入模拟数据（实际应用中应该从数据库获取）
// 这里为简化示例，我们直接定义一些模拟数据
const mockNotes = [
  {
    id: "note-1",
    title: "宪法基本原则",
    content: "宪法的基本原则包括：\n1. 人民主权原则\n2. 基本人权原则\n3. 法治原则\n4. 权力制约原则\n5. 民主集中制原则",
    createdAt: new Date("2023-05-10").toISOString(),
    updatedAt: new Date("2023-05-12").toISOString(),
    userId: "user-1",
    aiResponse: "宪法是国家的根本大法，它确立了国家的根本制度和根本任务，规定了公民的基本权利和义务。人民主权原则是指国家的一切权力属于人民，这是我国宪法的核心原则。基本人权原则体现在宪法对公民基本权利的保障上。法治原则要求全社会都必须在宪法和法律范围内活动。权力制约原则则是防止权力滥用的重要保障。民主集中制是我国国家机构的组织和活动的基本原则。"
  },
  {
    id: "note-2",
    title: "民法典中的继承制度",
    content: "继承分为法定继承和遗嘱继承。\n法定继承人顺序：\n第一顺序：配偶、子女、父母\n第二顺序：兄弟姐妹、祖父母、外祖父母",
    createdAt: new Date("2023-06-05").toISOString(),
    updatedAt: new Date("2023-06-05").toISOString(),
    userId: "user-1",
    aiResponse: "《民法典》中的继承制度是保障公民私有财产依法得到传承的重要法律制度。遗嘱继承优先于法定继承，即被继承人立有合法有效的遗嘱的，按照遗嘱继承办理；没有遗嘱的，才按照法定继承办理。在法定继承中，第一顺序继承人优先于第二顺序继承人继承。同一顺序继承人继承遗产的份额，一般应当均等。对生活有特殊困难又缺乏劳动能力的继承人，分配遗产时，应当予以照顾。对被继承人尽了主要扶养义务或者与被继承人共同生活的继承人，分配遗产时，可以多分。"
  },
  {
    id: "note-3",
    title: "教育心理学笔记",
    content: "布鲁姆的教育目标分类：\n1. 认知领域：知识、理解、应用、分析、综合、评价\n2. 情感领域：接受、反应、价值、组织、个性化\n3. 动作技能领域：知觉、准备活动、引导反应、机械动作、复杂外显反应、适应、创造",
    createdAt: new Date("2023-04-20").toISOString(),
    updatedAt: new Date("2023-04-22").toISOString(),
    userId: "user-2",
    aiResponse: "布鲁姆的教育目标分类学是教育评价领域的重要理论。在认知领域，这六个层次是按照复杂性和抽象性递增的顺序排列的。从基础的知识记忆，到理解意义，再到将知识应用于新情境，然后是分析组成部分，综合创造新内容，最后是做出价值判断。这一分类为教师设计教学目标和评估学生学习成果提供了科学框架。在最新修订版中，'综合'和'评价'的位置进行了调整，并将名词形式改为动词形式，更强调行为导向。"
  }
];

// 获取单个笔记
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const note = mockNotes.find((note) => note.id === id);

    if (!note) {
      return NextResponse.json(
        { message: "笔记未找到" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json(
      { message: "获取笔记过程中出现错误" },
      { status: 500 }
    );
  }
}

// 更新笔记
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const noteIndex = mockNotes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      return NextResponse.json(
        { message: "笔记未找到" },
        { status: 404 }
      );
    }

    const { title, content } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { message: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    // 模拟更新笔记
    const updatedNote = {
      ...mockNotes[noteIndex],
      title,
      content,
      updatedAt: new Date().toISOString(),
      // 在实际应用中，这里可能会调用AI服务来生成新的笔记反馈
      aiResponse: "这是更新后生成的AI笔记反馈。在实际应用中，这会由AI模型根据更新后的笔记内容重新生成。"
    };

    // 实际应用中会更新数据库
    // 这里仅返回模拟更新的笔记
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("更新笔记失败:", error);
    return NextResponse.json(
      { message: "更新笔记过程中出现错误" },
      { status: 500 }
    );
  }
}

// 删除笔记
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const noteExists = mockNotes.some((note) => note.id === id);

    if (!noteExists) {
      return NextResponse.json(
        { message: "笔记未找到" },
        { status: 404 }
      );
    }

    // 实际应用中会从数据库删除笔记
    // 这里仅返回成功消息
    return NextResponse.json(
      { message: "笔记已成功删除" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json(
      { message: "删除笔记过程中出现错误" },
      { status: 500 }
    );
  }
} 