# AI考试陪伴系统环境设置指南

本文档提供如何安装、配置和运行AI考试陪伴系统的详细说明。

## 前提条件

确保您的系统已安装以下软件：

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器
- PostgreSQL 数据库

## 安装步骤

### 1. 克隆或下载项目

```bash
git clone <repository-url>
cd ai-exam-companion
```

### 2. 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 或使用pnpm
pnpm install
```

### 3. 安装额外的后端依赖

```bash
npm install @prisma/client bcrypt next-auth ai openai-edge --save
npm install prisma @types/bcrypt --save-dev

# 或使用yarn
yarn add @prisma/client bcrypt next-auth ai openai-edge
yarn add prisma @types/bcrypt --dev

# 或使用pnpm
pnpm add @prisma/client bcrypt next-auth ai openai-edge
pnpm add -D prisma @types/bcrypt
```

### 4. 设置环境变量

复制示例环境变量文件并配置您的环境：

```bash
cp .env.example .env
```

然后编辑`.env`文件，填入您的环境变量值：

```
DATABASE_URL="postgresql://user:password@localhost:5432/ai_exam_companion"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
```

### 5. 设置数据库

确保PostgreSQL运行，然后执行以下命令设置数据库：

```bash
# 创建数据库迁移
npx prisma migrate dev --name init

# 生成Prisma客户端
npx prisma generate
```

### 6. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 初始化测试数据

为了方便测试，您可以运行以下命令填充初始数据：

```bash
npx prisma db seed
```

这将添加：
- 测试用户账号
- AI角色
- 科目和子类别
- 示例考试和题目

## 数据库管理

您可以使用Prisma Studio查看和编辑数据库：

```bash
npx prisma studio
```

Prisma Studio将在 [http://localhost:5555](http://localhost:5555) 启动。

## 常见问题解决

### 数据库连接问题

如果遇到数据库连接问题，请检查：
- 数据库服务是否运行
- `.env`文件中的数据库连接字符串是否正确
- 数据库用户是否有足够权限

### OpenAI API错误

如果AI聊天功能不工作，请确认：
- 您的OpenAI API密钥有效
- 检查API调用限制
- 查看服务器日志中的详细错误信息

## 部署建议

对于生产环境，建议：

1. 使用Vercel部署Next.js应用
2. 对于数据库，可以使用:
   - Vercel Postgres
   - Supabase
   - Railway
   - PlanetScale
3. 确保设置所有必要的环境变量
4. 部署前运行`npm run build`检查构建是否成功 