# AI考试助手

## 项目简介

AI考试助手是一个帮助用户备考各类考试的智能学习平台，支持公务员考试、教师资格证考试和法律职业资格考试等。系统基于Next.js 14开发，采用App Router架构，结合人工智能技术提供个性化学习指导和备考方案。

## 特色功能

- 智能AI学习伙伴，提供个性化辅导和问答
- 人性化的引导流程，根据用户情况定制学习计划
- 考试知识库和模拟题库
- 学习进度追踪和统计分析
- 笔记管理功能

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL
- **AI模型**: DeepSeek

## 项目API文档

本项目实现了以下模拟API端点，提供完整的应用功能支持：

### 认证相关API

#### 登录 - POST /api/auth/login
用于用户登录，验证用户凭据并创建会话。

**请求体示例**:
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**成功响应**:
```json
{
  "message": "登录成功",
  "user": {
    "id": "user-1",
    "name": "张三",
    "email": "zhangsan@example.com",
    "subject": "公务员考试",
    "avatarUrl": "/avatars/avatar1.png",
    "onboardingCompleted": true,
    "role": "user",
    "createdAt": "2023-07-01T08:00:00Z"
  }
}
```

#### 注册 - POST /api/auth/register
创建新用户账号并设置初始用户信息。

**请求体示例**:
```json
{
  "name": "王五",
  "email": "wangwu@example.com",
  "password": "password123",
  "subject": "法律职业资格考试"
}
```

**成功响应**:
```json
{
  "message": "注册成功",
  "user": {
    "id": "user-3",
    "name": "王五",
    "email": "wangwu@example.com",
    "subject": "法律职业资格考试",
    "avatarUrl": "/avatars/default.png",
    "onboardingCompleted": false,
    "role": "user",
    "createdAt": "2023-10-22T12:34:56Z"
  }
}
```

#### 注销 - POST /api/auth/logout
清除用户会话，实现注销功能。

**成功响应**:
```json
{
  "message": "注销成功"
}
```

#### 获取会话 - GET /api/auth/session
获取当前登录用户的会话信息。

**成功响应**:
```json
{
  "message": "获取会话成功",
  "session": {
    "userId": "user-1",
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "user",
    "subject": "公务员考试",
    "avatarUrl": "/avatars/avatar1.png",
    "onboardingCompleted": true
  }
}
```

### 用户资料API

#### 获取用户资料 - GET /api/user/profile
获取当前登录用户的详细资料。

**成功响应**:
```json
{
  "id": "user-1",
  "name": "张三",
  "email": "zhangsan@example.com",
  "subject": "公务员考试",
  "avatarUrl": "/avatars/avatar1.png",
  "onboardingCompleted": true,
  "role": "user",
  "createdAt": "2023-07-01T08:00:00Z",
  "studyGoals": {
    "dailyMinutes": 60,
    "weeklyExams": 2
  },
  "preferences": {
    "theme": "light",
    "notifications": true,
    "email": true,
    "language": "zh-CN"
  }
}
```

#### 更新用户资料 - PUT /api/user/profile
更新当前登录用户的资料信息。

**请求体示例**:
```json
{
  "name": "张三丰",
  "subject": "法律职业资格考试",
  "studyGoals": {
    "dailyMinutes": 90
  },
  "preferences": {
    "theme": "dark"
  }
}
```

**成功响应**:
```json
{
  "message": "用户资料更新成功",
  "user": {
    "id": "user-1",
    "name": "张三丰",
    "email": "zhangsan@example.com",
    "subject": "法律职业资格考试",
    "avatarUrl": "/avatars/avatar1.png",
    "onboardingCompleted": true,
    "role": "user",
    "createdAt": "2023-07-01T08:00:00Z",
    "studyGoals": {
      "dailyMinutes": 90,
      "weeklyExams": 2
    },
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "email": true,
      "language": "zh-CN"
    }
  }
}
```

### 学习内容API

#### 获取笔记列表 - GET /api/notes
获取用户的笔记列表，支持分页、搜索和筛选。

**查询参数**:
- `noteId`: 笔记ID (可选)
- `subject`: 学科 (可选)
- `category`: 分类 (可选)
- `favorite`: 是否收藏 (可选)
- `search`: 搜索关键词 (可选)

**成功响应**:
```json
{
  "notes": [
    {
      "id": "note-1",
      "title": "行政法基本原则总结",
      "content": "# 行政法基本原则\n\n## 1. 法律优位原则...",
      "subject": "公务员考试",
      "category": "行政法",
      "tags": ["公考", "行政法", "基本原则"],
      "favorite": true,
      "createdAt": "2023-08-15T14:30:00Z",
      "updatedAt": "2023-10-10T09:15:00Z"
    },
    ...
  ],
  "total": 10
}
```

#### 创建笔记 - POST /api/notes
创建新的笔记。

**请求体示例**:
```json
{
  "title": "民法典重点条款",
  "content": "# 民法典重点条款\n\n## 第一编 总则...",
  "subject": "法律职业资格考试",
  "category": "民法",
  "tags": ["法考", "民法", "条款"]
}
```

**成功响应**:
```json
{
  "message": "笔记创建成功",
  "note": {
    "id": "note-4",
    "title": "民法典重点条款",
    "content": "# 民法典重点条款\n\n## 第一编 总则...",
    "subject": "法律职业资格考试",
    "category": "民法",
    "tags": ["法考", "民法", "条款"],
    "favorite": false,
    "createdAt": "2023-10-22T12:34:56Z",
    "updatedAt": "2023-10-22T12:34:56Z"
  }
}
```

#### 更新笔记 - PUT /api/notes?noteId=note-1
更新指定ID的笔记。

**请求体示例**:
```json
{
  "title": "行政法基本原则完整总结",
  "content": "更新后的内容...",
  "tags": ["公考", "行政法", "基本原则", "重点"]
}
```

**成功响应**:
```json
{
  "message": "笔记更新成功",
  "note": {
    "id": "note-1",
    "title": "行政法基本原则完整总结",
    "content": "更新后的内容...",
    "subject": "公务员考试",
    "category": "行政法",
    "tags": ["公考", "行政法", "基本原则", "重点"],
    "favorite": true,
    "createdAt": "2023-08-15T14:30:00Z",
    "updatedAt": "2023-10-22T12:34:56Z"
  }
}
```

#### 删除笔记 - DELETE /api/notes?noteId=note-1
删除指定ID的笔记。

**成功响应**:
```json
{
  "message": "笔记删除成功",
  "noteId": "note-1"
}
```

#### 获取考试列表 - GET /api/exams
获取可用的考试列表，支持按科目或考试ID筛选。

**查询参数**:
- `examId`: 考试ID (可选)
- `subject`: 学科 (可选)

**成功响应示例**:
```json
[
  {
    "id": "exam-1",
    "title": "行政职业能力测验模拟试卷(一)",
    "subject": "公务员考试",
    "category": "行测",
    "description": "本套试卷模拟国家公务员考试行政职业能力测验真题，难度适中，适合入门阶段练习。",
    "totalQuestions": 135,
    "totalTime": 120,
    "passingScore": 60,
    "difficulty": "中等",
    "tags": ["行测", "公务员", "模拟题"],
    "sections": [
      {
        "title": "常识判断",
        "questions": [
          {
            "id": "q-1",
            "type": "single-choice",
            "content": "下列关于我国政府机构的说法，正确的是：",
            "options": [
              "国务院是我国最高权力机关",
              "全国人大是我国最高行政机关",
              "国务院是我国最高行政机关",
              "全国政协是我国最高监督机关"
            ],
            "correctAnswer": 2,
            "analysis": "国务院是中华人民共和国最高行政机关，全国人大是我国最高权力机关。"
          }
        ]
      }
    ]
  }
]
```

### 学习统计API

#### 获取学习统计 - GET /api/stats
获取用户的学习统计数据，包括学习时间、考试成绩等。

**查询参数**:
- `period`: 统计周期 (day, week, month, year, all)，默认为week

**成功响应**:
```json
{
  "subject": "公务员考试",
  "examDate": "2024-05-15",
  "dailyGoal": 120,
  "studyTime": {
    "total": 840,
    "completedDays": 4,
    "averageDaily": 120,
    "trend": [
      {
        "date": "2023-10-15",
        "duration": 75,
        "completed": false,
        "goal": 120
      }
    ]
  },
  "examPerformance": {
    "averageScore": 83,
    "highestScore": 88,
    "totalExams": 4,
    "trend": [
      {
        "date": "2023-09-28",
        "title": "公务员考试模拟卷一",
        "score": 78,
        "category": "行政职业能力测试"
      }
    ],
    "categoryAverages": [
      {
        "category": "行政职业能力测试",
        "averageScore": 83,
        "examCount": 3
      },
      {
        "category": "申论",
        "averageScore": 85,
        "examCount": 1
      }
    ]
  },
  "studyStatus": {
    "daysToExam": 205,
    "recentActivity": true,
    "consistencyScore": 57,
    "averageScoreColor": "orange",
    "progressSummary": "距离考试还有205天，请制定合理的学习计划，打好基础。"
  }
}
```

### AI交互API

#### 聊天对话 - POST /api/chat
与AI助手进行对话交互。

**请求体示例**:
```json
{
  "message": "能帮我解释一下行政法中的比例原则吗？"
}
```

**成功响应**:
```json
{
  "id": "msg-123",
  "role": "assistant",
  "content": "比例原则是行政法中的重要原则之一，指行政机关采取的措施应当与行政目的之间保持适当的比例关系。它包括三个子原则：\n\n1. 适当性原则：行政措施必须有助于目的的实现；\n2. 必要性原则：在多种可选择的手段中，应选择对相对人权益损害最小的手段；\n3. 狭义比例原则：行政措施给相对人造成的损害不应与行政目的的公共利益明显不成比例。\n\n比例原则的本质是要求行政权力的行使要适度，避免滥用行政权力，保护公民权益。",
  "createdAt": "2023-10-22T12:34:56Z"
}
```

## 安装与运行

1. 克隆项目
```bash
git clone https://github.com/yourusername/ai-exam-companion.git
cd ai-exam-companion
```

2. 安装依赖
```bash
npm install
```

3. 设置环境变量
创建`.env.local`文件并添加以下内容：
```
DATABASE_URL=your_database_connection_string
DEEPSEEK_API_KEY=your_deepseek_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. 运行开发服务器
```bash
npm run dev
```

5. 浏览器访问 http://localhost:3000 

## 开发进度总结 (${new Date().toISOString().split('T')[0]})

### 会话主要目的
- 完成后台知识库管理功能的开发
- 实现文件上传和管理功能
- 建立与Supabase存储的连接

### 完成的主要任务
1. 创建了后台知识库管理界面
2. 实现了文件上传组件和上传API
3. 实现了文件列表展示、删除和分类管理功能
4. 搭建了与Supabase的集成

### 关键决策和解决方案
- 采用Supabase作为文件存储和数据库服务
- 根据环境(开发/生产)提供不同的实现
- 将文件上传和管理限制在管理后台
- 提供模拟数据用于开发环境测试

### 使用的技术栈
- Next.js API Routes
- Supabase Storage
- TypeScript
- React Hooks
- Tailwind CSS

### 修改/创建的文件
- `/app/admin/knowledge/page.tsx` - 知识库管理界面
- `/app/api/upload/route.ts` - 文件上传API
- `/app/api/admin/knowledge/route.ts` - 知识库管理API
- `/lib/supabase/server.ts` - Supabase服务端连接
- `/lib/supabase/client.ts` - Supabase客户端连接
- `/.env.example` - 环境变量示例

## 2024-03-26 本地测试环境配置

### 会话主要目的
- 配置本地测试环境，确保所有必要的环境变量和依赖都已正确设置

### 完成的主要任务
1. 创建了 `.env.local` 文件，包含所有必要的环境变量
2. 添加了 Supabase 相关的配置
3. 安装了 Supabase 相关的依赖包

### 关键决策和解决方案
- 使用 Supabase 作为文件存储和数据库解决方案
- 配置了本地开发环境所需的所有环境变量
- 更新了项目依赖，添加了 Supabase 客户端库

### 使用的技术栈
- Next.js
- Supabase
- Prisma
- NextAuth.js

### 修改的文件
- 新建: `.env.local`
- 修改: `package.json` 