# Vercel 部署指南

## 环境变量设置

在 Vercel 部署时，需要设置以下环境变量：

1. **必需环境变量**:
   - `DATABASE_URL`: PostgreSQL 数据库连接字符串
   - `NEXTAUTH_SECRET`: 用于 NextAuth 的密钥（可使用随机字符串）
   - `NEXTAUTH_URL`: 你的应用程序URL（如 https://yourapp.vercel.app）

2. **可选环境变量**:
   - `DEEPSEEK_API_KEY`: DeepSeek AI API 密钥（非必需，未配置时使用模拟响应）

## 部署步骤

1. **连接 GitHub 仓库**:
   - 在 Vercel 控制台中点击 "Add New"
   - 选择 "Project"
   - 选择包含你的代码的 GitHub 仓库
   - 点击 "Import"

2. **配置项目**:
   - 项目名称: 输入你希望的项目名
   - 框架预设: Next.js
   - 根目录: ./
   - 构建命令: `prisma generate && next build` (已在 vercel.json 中设置)

3. **环境变量配置**:
   - 点击 "Environment Variables" 部分
   - 添加上述必需的环境变量
   - 确保 DATABASE_URL 指向有效的 PostgreSQL 数据库

4. **高级选项**:
   - 如果需要，可以点击 "Show Advanced" 自定义更多设置

5. **部署**:
   - 点击 "Deploy" 按钮开始部署

## 数据库初始化

初始部署后，需要设置数据库架构：

1. **使用 Vercel CLI**:
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 登录
   vercel login
   
   # 切换到项目目录
   cd your-project
   
   # 推送数据库架构
   vercel env pull .env
   npx prisma db push
   ```

2. **初始化基础数据**:
   你可以执行以下脚本来添加基础数据：
   ```bash
   npx ts-node -O '{"module":"CommonJS"}' prisma/seed.ts
   ```

## 部署常见问题

### 构建错误

如果遇到构建错误，请检查:
- 环境变量是否设置正确
- package.json 中的依赖是否完整
- 代码中是否有不兼容的 API 调用

### 数据库连接问题

确保:
- DATABASE_URL 格式正确
- 数据库服务器允许来自 Vercel 的连接
- 数据库用户有足够的权限
- 数据库服务器防火墙设置允许外部连接

### 身份验证问题

确保:
- NEXTAUTH_SECRET 已设置
- NEXTAUTH_URL 设置为你的实际部署域名 