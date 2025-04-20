import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST 方法 - 用户注销
 */
export async function POST(req: NextRequest) {
  try {
    // 清除session cookie
    cookies().delete("session");
    
    return NextResponse.json({
      message: "注销成功"
    });
  } catch (error) {
    console.error("注销失败:", error);
    return NextResponse.json(
      { message: "注销时出现错误" },
      { status: 500 }
    );
  }
}

/**
 * GET 方法 - 用户注销（可用于直接通过URL注销）
 */
export async function GET(req: NextRequest) {
  try {
    // 清除session cookie
    cookies().delete("session");
    
    // 重定向到登录页
    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    console.error("注销失败:", error);
    return NextResponse.json(
      { message: "注销时出现错误" },
      { status: 500 }
    );
  }
} 