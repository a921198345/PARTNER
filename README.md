# AI考试助手

这是一个使用Next.js 14构建的AI学习助手，帮助学生准备考试、组织笔记和提高学习效率。

## 主要功能

- **个性化AI助手**: 根据用户学习需求和风格定制的AI伙伴
- **考试练习**: 提供各类模拟考试和练习题库
- **笔记管理**: 智能笔记组织和思维导图生成
- **学习计划**: 个性化学习计划和进度追踪
- **知识库管理**: 上传和管理学习资料，自动提取重要知识点

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: SQLite (开发), PostgreSQL (生产)
- **AI集成**: OpenAI API, DeepSeek API
- **3D动画**: Three.js
- **认证**: NextAuth.js

## 开发指南

### 环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/ai-exam-companion.git
cd ai-exam-companion
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建一个 `.env` 文件，并添加以下内容:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_API_BASE_URL="https://api.deepseek.com/v1"
DEEPSEEK_MODEL="deepseek-chat"
```

4. 初始化数据库
```bash
npx prisma migrate dev
npx prisma db seed
```

5. 启动开发服务器
```bash
npm run dev
```

## 文档知识点提取功能

### 功能概述

文档知识点提取功能允许用户上传学习资料（如PDF、Word、TXT等文件），系统会自动提取其中的关键知识点，并进行结构化存储，方便用户查询和学习。

### 主要组件

1. **文档上传**: 支持多种文件格式，包括PDF、Word、TXT、Markdown等。

2. **文本提取**: 从不同格式的文档中提取纯文本内容。

3. **知识点识别**: 利用DeepSeek API从文本中识别重要知识点，并进行结构化处理。

4. **异步处理**: 使用后台队列处理系统处理大型文档，提高用户体验。

5. **文档管理界面**: 让用户轻松管理上传的文档和提取的知识点。

### 使用方法

1. 进入"学习资料"页面
2. 点击"上传文档"按钮
3. 选择科目和子类别
4. 拖放或选择要上传的文件
5. 系统会自动处理文档并提取知识点
6. 提取完成后，可以在文档详情页查看所有知识点

### API 端点

- `GET /api/documents`: 获取文档列表
- `POST /api/documents/upload`: 上传新文档
- `POST /api/documents/process`: 手动触发文档处理
- `GET /api/documents/{id}`: 获取文档详情及其知识点

### 数据模型

- `Document`: 存储文档元数据
- `KnowledgeEntry`: 存储从文档中提取的知识点
- `ProcessingJob`: 管理文档处理任务
- `ProcessingStep`: 记录处理步骤和进度

## 贡献指南

欢迎贡献代码和提出功能建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

该项目采用 MIT 许可证 