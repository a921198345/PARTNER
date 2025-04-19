import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 导出authOptions以便其他路由可以导入
export { authOptions };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 