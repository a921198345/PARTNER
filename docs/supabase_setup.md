# Supabase设置指南

## 1. 创建"documents"存储桶

1. 登录Supabase控制台
2. 点击左侧菜单中的"Storage"
3. 点击"创建新桶"按钮
4. 桶名称输入"documents"
5. 公共访问选择"Yes, make all objects public (via obscure URL)"
6. 点击"创建桶"按钮

## 2. 创建"knowledge_files"数据表

1. 登录Supabase控制台
2. 点击左侧菜单中的"Table Editor"
3. 点击"创建新表"按钮
4. 表名输入"knowledge_files"
5. 添加以下列:
   - `id` (类型: uuid, 主键: 是, 默认值: uuid_generate_v4())
   - `file_name` (类型: text, 非空: 是)
   - `file_path` (类型: text, 非空: 是)
   - `file_size` (类型: bigint, 非空: 是)
   - `file_type` (类型: text, 非空: 是)
   - `category` (类型: text, 非空: 是)
   - `public_url` (类型: text, 非空: 是)
   - `created_at` (类型: timestamp with time zone, 非空: 是, 默认值: now())
6. 点击"保存"按钮

## 3. 存储桶访问权限设置

1. 登录Supabase控制台
2. 点击左侧菜单中的"Storage"
3. 选择刚创建的"documents"存储桶
4. 点击"Policies"标签
5. 添加以下策略:
   - 新建"Insert"策略: (name: "Allow public uploads", definition: `true`)
   - 新建"Select"策略: (name: "Allow public downloads", definition: `true`)
6. 点击"Review"和"Save policy"按钮

完成以上设置后，您的Supabase将准备好接收文件上传和存储知识库文件记录。 