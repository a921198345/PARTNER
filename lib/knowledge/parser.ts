import { DeepSeekService } from '../deepseek';
import { prisma } from '../db';

/**
 * 文档处理服务
 * 提供对上传文档的解析和知识提取功能
 */
export class DocumentParser {
  /**
   * 处理上传的文档
   * @param documentId 文档ID
   */
  static async processDocument(documentId: string) {
    try {
      // 获取文档信息
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          subject: true,
          subCategory: true,
        },
      });

      if (!document) {
        throw new Error(`文档不存在: ${documentId}`);
      }

      // 更新处理状态
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: '处理中',
        },
      });

      // 获取文件内容
      const content = await this.extractContent(document.fileUrl, document.fileType);
      
      if (!content) {
        throw new Error('无法提取文档内容');
      }

      // 使用DeepSeek提取知识点
      const knowledgeEntries = await this.extractKnowledgeEntries(
        content,
        document.title,
        document.subject.name,
        document.subCategory?.name,
      );

      // 保存知识条目
      await this.saveKnowledgeEntries(knowledgeEntries, document);

      // 更新处理状态
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processed: true,
          processingStatus: '处理完成',
        },
      });

      return true;
    } catch (error) {
      console.error(`处理文档出错 (ID: ${documentId}):`, error);
      
      // 更新处理状态为失败
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      });
      
      return false;
    }
  }

  /**
   * 提取文档内容
   * @param fileUrl 文件URL
   * @param fileType 文件类型
   * @returns 文档内容
   */
  private static async extractContent(fileUrl: string, fileType: string): Promise<string> {
    // 注意：实际项目中应使用适当的库处理不同类型的文档
    // 例如: pdf.js, mammoth.js, node-docx-parser等
    
    // 这里使用简单的模拟实现
    try {
      // 模拟从不同类型文件提取文本
      // 真实场景中应根据文件类型使用不同的库
      switch (fileType.toLowerCase()) {
        case 'pdf':
          // 在真实项目中使用pdf.js或其他PDF解析库
          return `这是从PDF文件中提取的内容。文件路径: ${fileUrl}`;
        
        case 'docx':
          // 在真实项目中使用mammoth.js或其他DOCX解析库
          return `这是从DOCX文件中提取的内容。文件路径: ${fileUrl}`;
        
        case 'txt':
          // 在真实项目中直接读取文本文件
          return `这是从TXT文件中提取的内容。文件路径: ${fileUrl}`;
        
        default:
          throw new Error(`不支持的文件类型: ${fileType}`);
      }
    } catch (error) {
      console.error('提取文档内容失败:', error);
      throw error;
    }
  }

  /**
   * 使用DeepSeek提取知识条目
   * @param content 文档内容
   * @param documentTitle 文档标题
   * @param subject 学科名称
   * @param subCategory 子类别名称
   * @returns 知识条目数组
   */
  private static async extractKnowledgeEntries(
    content: string,
    documentTitle: string,
    subject: string,
    subCategory?: string,
  ): Promise<Array<{
    title: string;
    content: string;
    tags: string;
    importance: number;
  }>> {
    try {
      // 构建提示词
      const prompt = `
请从以下内容中提取关键知识点，格式为JSON数组。每个知识点包含以下字段：
- title: 知识点标题
- content: 知识点详细内容
- tags: 相关标签，以逗号分隔
- importance: 重要性评分(1-5)，5为最重要

文档标题: ${documentTitle}
学科: ${subject}
${subCategory ? `子类别: ${subCategory}` : ''}

内容:
${content.length > 8000 ? content.substring(0, 8000) + '...' : content}

请确保提取的知识点相互独立、内容完整，并按重要性排序。重点关注定义、概念、方法、公式、案例分析等关键内容。
返回格式示例:
[
  {
    "title": "知识点标题",
    "content": "知识点内容",
    "tags": "标签1,标签2",
    "importance": 5
  }
]
`;

      // 调用DeepSeek API
      const response = await DeepSeekService.chat({
        messages: [
          { role: 'system', content: '你是一个专业的知识提取助手，擅长从文档中提取结构化的知识点。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });
      
      const responseText = await response.text();
      
      // 提取JSON部分
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        throw new Error('无法从响应中提取JSON数据');
      }
      
      const jsonText = jsonMatch[0];
      const knowledgeEntries = JSON.parse(jsonText);
      
      return knowledgeEntries;
    } catch (error) {
      console.error('提取知识条目失败:', error);
      // 出错时返回空数组
      return [];
    }
  }

  /**
   * 保存知识条目到数据库
   * @param entries 知识条目数组
   * @param document 文档信息
   */
  private static async saveKnowledgeEntries(
    entries: Array<{
      title: string;
      content: string;
      tags: string;
      importance: number;
    }>,
    document: any
  ) {
    try {
      // 批量创建知识条目
      await Promise.all(
        entries.map(entry =>
          prisma.knowledgeEntry.create({
            data: {
              title: entry.title,
              content: entry.content,
              tags: entry.tags,
              importance: entry.importance,
              author: {
                connect: { id: document.uploadedById },
              },
              subject: {
                connect: { id: document.subjectId },
              },
              ...(document.subCategoryId
                ? {
                    subCategory: {
                      connect: { id: document.subCategoryId },
                    },
                  }
                : {}),
              document: {
                connect: { id: document.id },
              },
            },
          })
        )
      );
    } catch (error) {
      console.error('保存知识条目失败:', error);
      throw error;
    }
  }
} 