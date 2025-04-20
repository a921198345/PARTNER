import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 模拟笔记数据
const mockNotes = [
  {
    id: "note-1",
    title: "行政法基本原则总结",
    content: `# 行政法基本原则

## 1. 法律优位原则
- 行政法规、规章不得与宪法、法律相抵触
- 行政机关必须依照法律行使职权，执行公务
- 行政行为不得违背法律规定

## 2. 法律保留原则
- 行政机关实施行政管理，应当有法律依据
- 没有法律依据，行政机关不得作出影响公民、法人或者其他组织权利义务的决定

## 3. 比例原则
- 行政机关采取的措施应当与行政目的必要且适当
- 多种可能且符合法定要求的行政方式，应当避免采用对公民、法人和其他组织权益损害最大的方式

## 4. 平等原则
- 行政机关在适用法律时应当平等对待一切当事人
- 不得因性别、民族、宗教、社会地位等因素而区别对待

## 5. 程序正当原则
- 保障行政相对人的知情权、参与权和救济权
- 行政程序的设定和实施应当便民

## 6. 诚实信用原则
- 行政机关为了公共利益执行公务，必须秉持善意原则
- 行政机关应当尊重并履行其对行政相对人作出的承诺`,
    subject: "公务员考试",
    category: "行政法",
    tags: ["公考", "行政法", "基本原则"],
    favorite: true,
    createdAt: "2023-08-15T14:30:00Z",
    updatedAt: "2023-10-10T09:15:00Z"
  },
  {
    id: "note-2",
    title: "教育心理学重点名词解释",
    content: `# 教育心理学重点概念

## 学习理论

### 1. 行为主义学习理论
- **经典条件作用**：通过中性刺激与非中性刺激的联结，使中性刺激获得引起反应的能力
- **操作性条件作用**：通过强化或惩罚，增强或减弱某种行为发生的可能性
- **社会学习理论**：通过观察和模仿他人行为进行学习

### 2. 认知学习理论
- **认知结构**：个体已有知识的组织方式
- **图式**：认知结构的基本单位，是对事物、事件、情境的概括表征
- **同化**：将新信息纳入已有图式的过程
- **顺应**：修改已有图式以适应新信息的过程

### 3. 建构主义学习理论
- **支架式教学**：教师根据学习者已有的知识水平提供适当支持
- **最近发展区**：学生当前发展水平与潜在发展水平之间的差距
- **情境学习**：强调学习应在真实情境中进行

## 动机理论

### 1. 内部动机与外部动机
- **内部动机**：来自个体内部的学习兴趣和好奇心
- **外部动机**：为获得外部奖励或避免惩罚而产生的动机

### 2. 成就动机
- **成功期望**：个体对成功可能性的主观估计
- **成功价值**：成功对个体的重要性
- **归因理论**：个体对成功或失败原因的解释

## 教学与评价

### 1. 教学设计
- **掌握学习**：确保大多数学生掌握教学内容的教学策略
- **发现学习**：学生通过自主探索发现知识的学习方式
- **有意义学习**：新知识与已有认知结构建立联系的学习

### 2. 教学评价
- **形成性评价**：教学过程中进行的、旨在改进教学的评价
- **总结性评价**：教学结束后对学习结果的评价
- **真实性评价**：在真实情境中对学习者能力的综合评价`,
    subject: "教师资格证",
    category: "教育心理学",
    tags: ["教资", "心理学", "名词解释"],
    favorite: false,
    createdAt: "2023-07-20T10:45:00Z",
    updatedAt: "2023-09-18T16:20:00Z"
  },
  {
    id: "note-3",
    title: "刑法中的犯罪构成要件",
    content: `# 刑法中的犯罪构成要件

## 犯罪构成的四要件

### 1. 犯罪客体
犯罪行为所侵犯的社会关系，是刑法所保护的对象。
- **犯罪客体的种类**：
  - 一般客体：所有犯罪行为共同侵犯的社会关系
  - 同类客体：某一类犯罪所侵犯的社会关系
  - 直接客体：具体犯罪所侵犯的具体社会关系
- **犯罪对象**：犯罪行为直接作用的人或物

### 2. 犯罪客观方面
行为人实施的危害社会的行为及其所造成的危害结果和行为与结果之间的因果关系。
- **危害行为**：作为（积极行为）与不作为（消极行为）
- **危害结果**：物质性结果与非物质性结果
- **因果关系**：行为与结果之间的原因与结果的联系
- **犯罪的时间、地点、方法等**：影响定罪量刑的客观情节

### 3. 犯罪主体
达到法定刑事责任年龄且具有刑事责任能力，实施了危害社会行为的自然人和法人。
- **自然人犯罪主体的条件**：
  - 达到法定年龄（完全责任年龄16周岁，相对责任年龄14周岁）
  - 具有刑事责任能力
- **特殊主体**：具有特定身份或者具备其他特殊条件的犯罪主体
- **单位犯罪主体**：法律规定可以构成犯罪的单位

### 4. 犯罪主观方面
行为人对自己所实施的危害社会的行为及其危害结果所持的心理态度。
- **犯罪故意**：
  - 直接故意：明知自己的行为会发生危害社会的结果，并且希望这种结果发生
  - 间接故意：明知自己的行为可能发生危害社会的结果，并且放任这种结果发生
- **犯罪过失**：
  - 疏忽大意的过失：应当预见自己的行为可能发生危害社会的结果，因为疏忽大意而没有预见
  - 过于自信的过失：已经预见自己的行为可能发生危害社会的结果，但轻信能够避免
- **犯罪目的和动机**：行为人主观心理因素的组成部分，影响定罪量刑

## 犯罪构成的意义
1. 是区分犯罪行为与非犯罪行为的标准
2. 是确定罪名的依据
3. 是量刑的基础
4. 是刑法理论体系的基础`,
    subject: "法律职业资格考试",
    category: "刑法",
    tags: ["法考", "刑法", "犯罪构成"],
    favorite: true,
    createdAt: "2023-09-05T08:20:00Z",
    updatedAt: "2023-10-12T11:30:00Z"
  }
];

/**
 * GET 方法 - 获取笔记列表或单个笔记详情
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    const subject = searchParams.get("subject");
    const category = searchParams.get("category");
    const favoriteOnly = searchParams.get("favorite") === "true";
    const searchTerm = searchParams.get("search");
    
    // 如果提供了笔记ID，返回单个笔记详情
    if (noteId) {
      const note = mockNotes.find(note => note.id === noteId);
      
      if (!note) {
        return NextResponse.json(
          { message: "未找到笔记" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(note);
    }
    
    // 否则返回笔记列表（根据筛选条件）
    let filteredNotes = [...mockNotes];
    
    // 按学科筛选
    if (subject) {
      filteredNotes = filteredNotes.filter(note => 
        note.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    
    // 按分类筛选
    if (category) {
      filteredNotes = filteredNotes.filter(note => 
        note.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // 只显示收藏的笔记
    if (favoriteOnly) {
      filteredNotes = filteredNotes.filter(note => note.favorite);
    }
    
    // 按关键词搜索
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchTermLower) || 
        note.content.toLowerCase().includes(searchTermLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    }
    
    // 按时间降序排序
    filteredNotes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    // 返回笔记列表，不包含完整内容
    const notesWithPreview = filteredNotes.map(note => {
      // 创建内容预览，限制在200个字符
      const contentPreview = note.content.length > 200
        ? note.content.substring(0, 200) + '...'
        : note.content;
        
      return {
        ...note,
        content: contentPreview
      };
    });
    
    return NextResponse.json({
      notes: notesWithPreview,
      total: notesWithPreview.length
    });
  } catch (error) {
    console.error("获取笔记数据失败:", error);
    return NextResponse.json(
      { message: "获取笔记数据时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * POST 方法 - 创建新笔记（仅模拟）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 验证必要字段
    if (!body.title || !body.content || !body.subject) {
      return NextResponse.json(
        { message: "标题、内容和学科为必填项" },
        { status: 400 }
      );
    }
    
    // 创建新笔记（仅返回模拟成功响应）
    const newNote = {
      id: `note-${mockNotes.length + 1}`,
      title: body.title,
      content: body.content,
      subject: body.subject,
      category: body.category || "未分类",
      tags: body.tags || [],
      favorite: body.favorite || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: "笔记创建成功",
      note: newNote
    }, { status: 201 });
  } catch (error) {
    console.error("创建笔记失败:", error);
    return NextResponse.json(
      { message: "创建笔记时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * PUT 方法 - 更新笔记（仅模拟）
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    
    if (!noteId) {
      return NextResponse.json(
        { message: "缺少笔记ID" },
        { status: 400 }
      );
    }
    
    const note = mockNotes.find(note => note.id === noteId);
    
    if (!note) {
      return NextResponse.json(
        { message: "未找到笔记" },
        { status: 404 }
      );
    }
    
    const body = await req.json();
    
    // 模拟更新笔记
    const updatedNote = {
      ...note,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: "笔记更新成功",
      note: updatedNote
    });
  } catch (error) {
    console.error("更新笔记失败:", error);
    return NextResponse.json(
      { message: "更新笔记时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * DELETE 方法 - 删除笔记（仅模拟）
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    
    if (!noteId) {
      return NextResponse.json(
        { message: "缺少笔记ID" },
        { status: 400 }
      );
    }
    
    const note = mockNotes.find(note => note.id === noteId);
    
    if (!note) {
      return NextResponse.json(
        { message: "未找到笔记" },
        { status: 404 }
      );
    }
    
    // 模拟删除笔记
    return NextResponse.json({
      message: "笔记删除成功",
      noteId
    });
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json(
      { message: "删除笔记时出现错误" },
      { status: 500 }
    );
  }
} 