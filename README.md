# AI考试陪伴系统

学习搭子是一个智能AI考试陪伴系统，为各类考试学习者提供情感陪伴、知识辅导、学习管理等全方位服务，帮助用户高效备考，缓解考试压力。

## 主要功能

1. **情感陪伴**
   - 多种精致动态AI形象，语音情感丰富
   - 用户可选择喜爱的角色类型和设置昵称

2. **专业知识库**
   - 基于各科目考试资料构建的知识库
   - AI根据知识库准确回答用户问题

3. **学习计划与监督**
   - 通过AI对话设置每日学习时长目标
   - 监控学习时间并提供实时反馈
   - 完成目标奖励积分，未完成督促提醒

4. **真题题库**
   - 按科目、章节、年份分类的真题
   - 智能答题评测：答对继续，答错显示解析
   - 错题自动收集到错题本

5. **智能笔记系统**
   - 支持文字、文档上传、拍照记录
   - 自动生成思维导图，视觉化知识结构

## 技术架构

### 前端
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Framer Motion (动画效果)

### 后端
- Next.js API Routes
- Prisma ORM
- PostgreSQL 数据库
- NextAuth.js 身份验证
- OpenAI API 集成

### 数据存储
- 用户信息与设置
- 学习记录与统计
- 笔记与思维导图
- 题库与答题记录

## API接口文档

### 用户认证

#### 注册
- **端点**: `/api/auth/register`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "name": "用户名",
    "email": "邮箱",
    "password": "密码"
  }
  ```
- **响应**: 注册成功的用户信息

#### 登录
- **端点**: `/api/auth/[...nextauth]`
- **方法**: POST
- **描述**: 使用NextAuth.js处理登录流程

### 用户引导设置

#### 初始化用户设置
- **端点**: `/api/user/onboarding`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "subjectId": "科目ID",
    "aiCharacterId": "AI角色ID",
    "aiCustomName": "AI自定义名称",
    "userNickname": "用户昵称",
    "dailyStudyGoal": 3.5,
    "currentStage": "备考阶段"
  }
  ```
- **响应**: 更新后的用户信息

### AI角色

#### 获取角色列表
- **端点**: `/api/characters?gender=female`
- **方法**: GET
- **查询参数**: 
  - `gender`: 可选，按性别筛选(female/male)
- **响应**: AI角色列表

### 科目

#### 获取科目列表
- **端点**: `/api/subjects`
- **方法**: GET
- **响应**: 科目列表及子类别

### 聊天

#### 发送消息
- **端点**: `/api/chat`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "message": "用户消息",
    "chatHistory": [
      {"message": "之前的消息", "isUser": true},
      {"message": "AI回复", "isUser": false}
    ]
  }
  ```
- **响应**: 流式响应AI回复内容

### 学习时间

#### 记录学习时间
- **端点**: `/api/study-time`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "duration": 1.5,
    "websites": ["example.com/lesson1"]
  }
  ```
- **响应**: 更新后的学习记录和完成状态

#### 获取学习记录
- **端点**: `/api/study-time?period=week`
- **方法**: GET
- **查询参数**: 
  - `period`: 时间段(day/week/month)
- **响应**: 指定时间段的学习记录

### 真题题库

#### 获取考试列表
- **端点**: `/api/exams?subjectId=123&year=2023`
- **方法**: GET
- **查询参数**: 
  - `subjectId`: 科目ID
  - `subcategoryId`: 子类别ID
  - `year`: 年份
- **响应**: 符合条件的考试列表

#### 获取题目
- **端点**: `/api/exams/{examId}/questions?wrongOnly=false`
- **方法**: GET
- **查询参数**: 
  - `wrongOnly`: 是否只显示错题
- **响应**: 题目列表

#### 提交答案
- **端点**: `/api/exams/answer`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "examAttemptId": "考试尝试ID",
    "questionId": "问题ID",
    "userAnswer": "用户答案"
  }
  ```
- **响应**: 
  - 正确答案: 简单确认
  - 错误答案: 正确答案、解析和知识点

### 笔记系统

#### 获取笔记列表
- **端点**: `/api/notes`
- **方法**: GET
- **响应**: 用户笔记列表

#### 创建笔记
- **端点**: `/api/notes`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "title": "笔记标题",
    "content": "笔记内容",
    "attachments": [
      {"fileUrl": "文件URL", "fileType": "image"}
    ]
  }
  ```
- **响应**: 创建的笔记及自动生成的思维导图

## 数据库模型

项目使用Prisma ORM管理以下主要数据模型：

- User - 用户信息和设置
- AICharacter - AI角色配置
- Subject/SubCategory - 科目分类
- KnowledgeBase - 知识库内容
- StudyGoal/StudyRecord - 学习目标与记录
- Note/Attachment - 笔记与附件
- Exam/Question - 考试与题目
- ExamAttempt/AnswerAttempt - 答题记录
- ChatHistory - 聊天历史

## 环境设置

1. 复制环境变量示例文件
   ```
   cp .env.example .env
   ```

2. 配置关键环境变量
   - `DATABASE_URL` - PostgreSQL数据库连接
   - `NEXTAUTH_SECRET` - NextAuth密钥
   - `OPENAI_API_KEY` - OpenAI API密钥

3. 安装依赖
   ```
   npm install
   ```

4. 初始化数据库
   ```
   npx prisma migrate dev
   ```

5. 启动开发服务器
   ```
   npm run dev
   ```

## 部署

项目可以部署到Vercel或其他支持Next.js的平台上。确保配置好环境变量并连接数据库。 