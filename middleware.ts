import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 简化的中间件，仅用于演示
export function middleware(request: NextRequest) {
  // 允许访问所有页面，不做任何验证
  return NextResponse.next();
}

/**
 * 配置中间件匹配的路径
 * 排除不需要处理的静态资源和API路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下路径:
     * - api (API路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化API)
     * - favicon.ico (浏览器图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 