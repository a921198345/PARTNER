import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET 方法 - 获取当前用户会话信息
 */
export async function GET(req: NextRequest) {
  try {
    // 获取session cookie
    const sessionCookie = cookies().get("session");
    
    // 如果没有session cookie，表示用户未登录
    if (!sessionCookie) {
      return NextResponse.json(
        { message: "用户未登录" },
        { status: 401 }
      );
    }
    
    try {
      // 解析session
      const session = JSON.parse(sessionCookie.value);
      
      // 检查session是否过期
      if (new Date(session.expires) < new Date()) {
        // 清除过期的session
        cookies().delete("session");
        
        return NextResponse.json(
          { message: "会话已过期，请重新登录" },
          { status: 401 }
        );
      }
      
      // 返回用户信息（不包含expires字段，减少不必要的数据传输）
      const { expires, ...userSession } = session;
      
      return NextResponse.json({
        message: "获取会话成功",
        session: userSession
      });
    } catch (error) {
      // session解析失败，清除无效的cookie
      cookies().delete("session");
      
      return NextResponse.json(
        { message: "会话无效，请重新登录" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("获取会话失败:", error);
    return NextResponse.json(
      { message: "获取会话时出现错误" },
      { status: 500 }
    );
  }
} 