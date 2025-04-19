import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * 扩展默认的session用户以包含id
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
} 