import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 简化版的auth配置，用于快速部署
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize() {
        // 演示版本，始终返回模拟用户
        return {
          id: "demo-user-id",
          name: "演示用户",
          email: "demo@example.com",
        };
      }
    })
  ],
  callbacks: {
    async session({ session }) {
      if (session.user) {
        session.user.id = "demo-user-id";
      }
      return session;
    },
    async jwt({ token }) {
      token.id = "demo-user-id";
      return token;
    }
  },
  // 演示环境使用随机生成的密钥
  secret: "demo-nextauth-secret",
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });
  
  if (!user) {
    return null;
  }
  
  return user;
} 