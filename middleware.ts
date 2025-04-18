import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * 处理请求的中间件函数
 * 1. 检查公共路径，不需要验证
 * 2. 验证用户登录状态
 * 3. 检查用户是否完成引导流程
 */
export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. 公共路径跳过验证
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/api/webhooks/lemon" ||
      pathname === "/api/webhooks/stripe" ||
      pathname.startsWith("/api/auth") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // 2. 验证用户登录状态
    const token = await getToken({ req: request });

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(pathname));
      return NextResponse.redirect(url);
    }

    // 3. 检查用户是否完成引导流程
    if (
      (pathname === "/chat" ||
        pathname === "/dashboard" ||
        pathname === "/exams" ||
        pathname === "/notes") &&
      token
    ) {
      try {
        // 检查用户是否已选择学科和AI角色
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/profile`, {
          headers: {
            cookie: request.headers.get("cookie") || "",
            "x-middleware-cache": "no-cache",
          },
        });
        
        const profile = await res.json();
        
        if (!profile.subject || !profile.aiCharacter) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        // 出错时继续，避免阻止用户访问
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

/**
 * 配置中间件匹配的路径
 * 排除不需要处理的静态资源和API路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除:
     * - /api/auth (认证API)
     * - /_next/static (静态文件)
     * - /_next/image (图片优化)
     * - /favicon.ico (网站图标)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 