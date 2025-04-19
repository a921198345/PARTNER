import { PrismaClient } from "@prisma/client";

// 使用globalThis加上类型判断来确保热重载不会创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建Prisma客户端实例
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

// 只有在生产环境下才将prisma赋值给globalThis
if (process.env.NODE_ENV !== "development") {
  globalForPrisma.prisma = prisma;
}

// 只使用默认导出，避免重复导出
export default prisma; 