import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 导出标准的NextAuth处理函数
const handler = NextAuth(authOptions);

// 导出为GET和POST处理函数
export { handler as GET, handler as POST }; 