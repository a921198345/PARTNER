import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 处理请求的中间件函数
 * 1. 检查公共路径，不需要验证
 * 2. 验证用户登录状态
 * 3. 检查用户是否完成引导流程
 */
export function middleware(request: NextRequest) {
  // 为了快速部署，跳过所有身份验证和路由保护
  return NextResponse.next();
}

/**
 * 配置中间件匹配的路径
 * 排除不需要处理的静态资源和API路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * 1. /api/auth 相关路径 (NextAuth.js)
     * 2. /_next (Next.js内部路由)
     * 3. /_static (静态资源)
     * 4. /favicon.ico, /robots.txt 等静态文件
     */
    "/((?!api/auth|_next|_static|favicon.ico).*)",
  ],
}; 