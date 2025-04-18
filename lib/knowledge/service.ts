import { prisma } from "@/lib/db";

/**
 * 知识库检索服务
 * 提供知识库检索功能，支持基于语义的检索
 */
export class KnowledgeService {
  /**
   * 搜索知识库
   * @param query 搜索关键词
   * @param subjectId 学科ID
   * @param limit 限制返回数量
   * @returns 相关知识条目
   */
  static async searchKnowledge(query: string, subjectId?: string, limit: number = 5) {
    const startTime = Date.now();
    
    try {
      // 构建查询条件
      const where: any = {};
      if (subjectId) {
        where.subjectId = subjectId;
      }
      
      // 基于关键词进行搜索
      // 注意：真实场景应使用向量数据库或相似度算法
      const results = await prisma.knowledgeEntry.findMany({
        where: {
          ...where,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        include: {
          subject: true,
          subCategory: true,
        },
        orderBy: {
          importance: 'desc',
        },
        take: limit,
      });
      
      // 记录搜索日志
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      await prisma.knowledgeSearchLog.create({
        data: {
          query,
          results: JSON.stringify(results),
          responseTime,
          userQuery: query,
          aiResponse: "", // 由聊天API填充
        },
      });
      
      return results;
    } catch (error) {
      console.error("知识库搜索失败:", error);
      return [];
    }
  }

  /**
   * 获取知识条目详情
   * @param id 知识条目ID
   * @returns 知识条目详情
   */
  static async getKnowledgeEntryById(id: string) {
    try {
      const entry = await prisma.knowledgeEntry.findUnique({
        where: { id },
        include: {
          subject: true,
          subCategory: true,
        },
      });
      
      if (entry) {
        // 更新查看次数
        await prisma.knowledgeEntry.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      }
      
      return entry;
    } catch (error) {
      console.error("获取知识条目失败:", error);
      return null;
    }
  }

  /**
   * 根据上下文构建知识库提示
   * @param query 用户查询
   * @param subjectId 学科ID
   * @returns 知识库提示
   */
  static async buildKnowledgePrompt(query: string, subjectId?: string): Promise<string> {
    const knowledgeEntries = await this.searchKnowledge(query, subjectId, 3);
    
    if (knowledgeEntries.length === 0) {
      return "";
    }
    
    let prompt = "以下是与用户问题相关的知识库内容，请基于这些内容回答用户的问题：\n\n";
    
    knowledgeEntries.forEach((entry, index) => {
      prompt += `【知识点${index + 1}】${entry.title}\n`;
      prompt += `${entry.content}\n\n`;
    });
    
    prompt += "请基于上述知识点回答用户问题，如果知识点中未包含相关信息，可以使用你自己的知识进行补充，但优先使用上述知识点中的内容。";
    
    return prompt;
  }

  /**
   * 更新AI响应到搜索日志
   * @param logId 日志ID
   * @param aiResponse AI响应内容
   */
  static async updateSearchLogWithResponse(logId: string, aiResponse: string) {
    try {
      await prisma.knowledgeSearchLog.update({
        where: { id: logId },
        data: { aiResponse },
      });
    } catch (error) {
      console.error("更新搜索日志失败:", error);
    }
  }
} 