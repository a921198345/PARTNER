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
    try {
      // 基于关键词进行简单搜索
      const results = await prisma.knowledgeEntry.findMany({
        where: {
          ...(subjectId ? { subjectId } : {}),
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        take: limit,
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
   * 根据用户查询和学科ID构建知识提示
   */
  static async buildKnowledgePrompt(query: string, subjectId?: string): Promise<string> {
    try {
      // 从知识点搜索相关内容
      const knowledgePoints = await this.searchKnowledgePoints(query, subjectId);
      
      if (!knowledgePoints || knowledgePoints.length === 0) {
        return "";
      }
      
      // 构建提示内容
      let prompt = "以下是与问题相关的知识点：\n\n";
      
      knowledgePoints.forEach((point, index) => {
        prompt += `知识点 ${index + 1}：${point.title}\n`;
        prompt += `${point.content}\n\n`;
      });
      
      prompt += "请根据以上知识点回答用户的问题。如果知识点不足以回答，请基于你的通用知识作答。";
      
      return prompt;
    } catch (error) {
      console.error("构建知识提示失败:", error);
      return "";
    }
  }
  
  /**
   * 根据查询内容搜索知识点
   */
  static async searchKnowledgePoints(query: string, subjectId?: string, limit: number = 3) {
    try {
      // 简单实现 - 基于标题和内容的关键词匹配
      const whereClause: any = {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      };
      
      // 如果提供了学科ID，则按学科筛选
      if (subjectId) {
        whereClause.subjectId = subjectId;
      }
      
      const points = await prisma.knowledgePoint.findMany({
        where: whereClause,
        take: limit,
      });
      
      return points;
    } catch (error) {
      console.error("搜索知识点失败:", error);
      return [];
    }
  }
  
  /**
   * 获取文档列表
   */
  static async getDocuments(subjectId?: string, subCategoryId?: string) {
    const whereClause: any = {};
    
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }
    
    if (subCategoryId) {
      whereClause.subCategoryId = subCategoryId;
    }
    
    try {
      const documents = await prisma.document.findMany({
        where: whereClause,
        include: {
          subject: true,
          subCategory: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              knowledgePoints: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        subject: doc.subject.name,
        subCategory: doc.subCategory?.name,
        uploadedAt: doc.createdAt.toISOString(),
        knowledgePointCount: doc._count.knowledgePoints,
      }));
    } catch (error) {
      console.error("获取文档列表失败:", error);
      return [];
    }
  }
  
  /**
   * 获取知识点列表
   */
  static async getKnowledgePoints(documentId?: string, subjectId?: string, subCategoryId?: string) {
    const whereClause: any = {};
    
    if (documentId) {
      whereClause.documentId = documentId;
    }
    
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }
    
    if (subCategoryId) {
      whereClause.subCategoryId = subCategoryId;
    }
    
    try {
      const knowledgePoints = await prisma.knowledgePoint.findMany({
        where: whereClause,
        include: {
          document: {
            select: {
              id: true,
              title: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return knowledgePoints.map(point => ({
        id: point.id,
        title: point.title,
        content: point.content,
        importance: point.importance,
        documentId: point.documentId,
        documentTitle: point.document.title,
        subject: point.subject.name,
        subCategory: point.subCategory?.name,
        viewCount: point.viewCount,
        createdAt: point.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("获取知识点列表失败:", error);
      return [];
    }
  }
  
  /**
   * 更新知识点
   */
  static async updateKnowledgePoint(id: string, data: { title?: string; content?: string; importance?: string }) {
    try {
      const updated = await prisma.knowledgePoint.update({
        where: { id },
        data,
      });
      
      return updated;
    } catch (error) {
      console.error("更新知识点失败:", error);
      throw error;
    }
  }
  
  /**
   * 删除知识点
   */
  static async deleteKnowledgePoint(id: string) {
    try {
      await prisma.knowledgePoint.delete({
        where: { id },
      });
      
      return true;
    } catch (error) {
      console.error("删除知识点失败:", error);
      throw error;
    }
  }
  
  /**
   * 删除文档及其知识点
   */
  static async deleteDocument(id: string) {
    try {
      // 首先删除关联的知识点
      await prisma.knowledgePoint.deleteMany({
        where: { documentId: id },
      });
      
      // 然后删除文档
      await prisma.document.delete({
        where: { id },
      });
      
      return true;
    } catch (error) {
      console.error("删除文档失败:", error);
      throw error;
    }
  }
} 