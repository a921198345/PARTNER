import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";
import { extractTextFromDocument } from "./extractors";
import { DeepSeekAPI } from "../deepseek";
import { PrismaClient, Document, ProcessingJob, ProcessingStep } from "@prisma/client";
import { extractKnowledgePoints, KnowledgePoint } from "../deepseek/api";

const prismaClient = new PrismaClient();

/**
 * 文档处理器类
 * 负责文档的保存、处理和删除
 */
export class DocumentProcessor {
  private uploadsDir: string;

  constructor() {
    // 设置上传文件目录
    this.uploadsDir = path.join(process.cwd(), "uploads");
    this.ensureUploadsDir();
  }

  /**
   * 确保上传目录存在
   */
  private async ensureUploadsDir() {
    try {
      await fsPromises.access(this.uploadsDir);
    } catch (error) {
      await fsPromises.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * 保存上传的文件
   */
  async saveFile(file: File): Promise<{
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
  }> {
    // 生成唯一文件名
    const uniqueId = uuidv4();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${uniqueId}${extension}`;
    const filePath = path.join(this.uploadsDir, fileName);

    // 将文件内容转换为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 写入文件
    await fsPromises.writeFile(filePath, buffer);

    return {
      fileName: originalName,
      fileType: file.type,
      fileSize: file.size,
      filePath,
    };
  }

  /**
   * 创建新的处理任务
   */
  static async createProcessingJob(documentIds: string[], userId: string): Promise<ProcessingJob> {
    return await prismaClient.processingJob.create({
      data: {
        status: "queued",
        priority: 1,
        createdBy: {
          connect: { id: userId }
        },
        documents: {
          connect: documentIds.map(id => ({ id }))
        }
      },
      include: {
        documents: true
      }
    });
  }

  /**
   * 获取下一个待处理的任务
   */
  static async getNextJob(): Promise<ProcessingJob | null> {
    return await prismaClient.processingJob.findFirst({
      where: {
        status: "queued"
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" }
      ],
      include: {
        documents: true
      }
    });
  }

  /**
   * 开始处理任务
   */
  static async startProcessing(jobId: string): Promise<ProcessingJob> {
    return await prismaClient.processingJob.update({
      where: { id: jobId },
      data: {
        status: "processing",
        startTime: new Date()
      }
    });
  }

  /**
   * 完成处理任务
   */
  static async completeJob(jobId: string): Promise<ProcessingJob> {
    return await prismaClient.processingJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        endTime: new Date()
      }
    });
  }

  /**
   * 处理任务失败
   */
  static async failJob(jobId: string, errorMessage: string): Promise<ProcessingJob> {
    return await prismaClient.processingJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage,
        endTime: new Date()
      }
    });
  }

  /**
   * 更新处理进度
   */
  static async updateProgress(jobId: string, progress: number): Promise<ProcessingJob> {
    return await prismaClient.processingJob.update({
      where: { id: jobId },
      data: { progress }
    });
  }

  /**
   * 创建处理步骤
   */
  static async createProcessingStep(
    jobId: string, 
    documentId: string, 
    type: string
  ): Promise<ProcessingStep> {
    return await prismaClient.processingStep.create({
      data: {
        job: { connect: { id: jobId } },
        document: { connect: { id: documentId } },
        type,
        status: "pending"
      }
    });
  }

  /**
   * 开始处理步骤
   */
  static async startProcessingStep(stepId: string): Promise<ProcessingStep> {
    return await prismaClient.processingStep.update({
      where: { id: stepId },
      data: {
        status: "processing",
        startTime: new Date()
      }
    });
  }

  /**
   * 完成处理步骤
   */
  static async completeProcessingStep(
    stepId: string, 
    result?: string
  ): Promise<ProcessingStep> {
    return await prismaClient.processingStep.update({
      where: { id: stepId },
      data: {
        status: "completed",
        progress: 100,
        result,
        endTime: new Date()
      }
    });
  }

  /**
   * 处理步骤失败
   */
  static async failProcessingStep(
    stepId: string, 
    errorMessage: string
  ): Promise<ProcessingStep> {
    return await prismaClient.processingStep.update({
      where: { id: stepId },
      data: {
        status: "failed",
        errorMessage,
        endTime: new Date()
      }
    });
  }

  /**
   * 主处理函数 - 处理单个文档
   */
  static async processDocument(document: Document, jobId: string): Promise<void> {
    try {
      // 1. 提取文本
      const textExtractionStep = await this.createProcessingStep(
        jobId,
        document.id,
        "extract_text"
      );
      
      await this.startProcessingStep(textExtractionStep.id);
      
      console.log(`开始从文档提取文本: ${document.fileName}`);
      const extractedText = await extractTextFromDocument(document.fileUrl);
      
      // 更新文档的提取文本
      await prismaClient.document.update({
        where: { id: document.id },
        data: { 
          extractedText,
          processingStatus: "text_extracted" 
        }
      });
      
      await this.completeProcessingStep(textExtractionStep.id, "文本提取完成");
      
      // 2. 提取知识点
      const knowledgeExtractionStep = await this.createProcessingStep(
        jobId,
        document.id,
        "extract_knowledge"
      );
      
      await this.startProcessingStep(knowledgeExtractionStep.id);
      
      console.log(`开始从文本提取知识点: ${document.fileName}`);
      
      // 获取科目名称
      const subject = await prismaClient.subject.findUnique({
        where: { id: document.subjectId }
      });
      
      if (!subject) {
        throw new Error("找不到文档关联的科目");
      }
      
      // 从文本中提取知识点
      const knowledgePoints = await extractKnowledgePoints(
        extractedText,
        subject.name
      );
      
      console.log(`从文档中提取了 ${knowledgePoints.length} 个知识点`);
      
      // 保存知识点到数据库
      for (const point of knowledgePoints) {
        const knowledgeEntry = await prismaClient.knowledgeEntry.create({
          data: {
            title: point.title,
            content: point.content,
            importance: point.importance,
            tags: JSON.stringify([subject.name]),
            author: { connect: { id: document.uploadedById } },
            subject: { connect: { id: document.subjectId } },
            ...(document.subCategoryId 
              ? { subCategory: { connect: { id: document.subCategoryId } } } 
              : {}),
            document: { connect: { id: document.id } }
          }
        });
        
        console.log(`创建了知识条目: ${knowledgeEntry.title}`);
      }
      
      await this.completeProcessingStep(
        knowledgeExtractionStep.id, 
        JSON.stringify({ count: knowledgePoints.length })
      );
      
      // 3. 更新文档状态为已处理
      await prismaClient.document.update({
        where: { id: document.id },
        data: { 
          processed: true,
          processingStatus: "completed" 
        }
      });
      
      console.log(`文档处理完成: ${document.fileName}`);
    } catch (error) {
      console.error(`处理文档失败:`, error);
      
      // 更新文档状态为处理失败
      await prismaClient.document.update({
        where: { id: document.id },
        data: { 
          processingStatus: "failed",
          processed: false
        }
      });
      
      // 重新抛出错误，让调用者处理
      throw error;
    }
  }

  /**
   * 运行处理队列
   */
  static async processQueue(): Promise<void> {
    try {
      // 获取下一个待处理任务
      const job = await this.getNextJob();
      
      if (!job) {
        console.log("没有待处理任务");
        return;
      }
      
      console.log(`开始处理任务: ${job.id}, 文档数: ${job.documents.length}`);
      
      // 更新任务状态为处理中
      await this.startProcessing(job.id);
      
      // 计算每个文档的进度百分比
      const progressPerDocument = 100 / job.documents.length;
      
      // 处理每个文档
      for (let i = 0; i < job.documents.length; i++) {
        const document = job.documents[i];
        
        try {
          await this.processDocument(document, job.id);
          
          // 更新任务进度
          const currentProgress = (i + 1) * progressPerDocument;
          await this.updateProgress(job.id, currentProgress);
        } catch (error) {
          console.error(`处理文档失败 ${document.fileName}:`, error);
          
          // 继续处理其他文档，不会使整个任务失败
          continue;
        }
      }
      
      // 完成任务
      await this.completeJob(job.id);
      
      console.log(`任务处理完成: ${job.id}`);
    } catch (error) {
      console.error("处理队列时出错:", error);
    }
  }

  /**
   * 后台处理器 - 可以在服务器启动时调用此方法
   */
  static async startBackgroundProcessor(intervalMs: number = 60000): Promise<void> {
    console.log("启动文档处理后台服务");
    
    // 首次立即处理队列
    await this.processQueue();
    
    // 定期处理队列
    setInterval(async () => {
      await this.processQueue();
    }, intervalMs);
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fsPromises.access(filePath);
      await fsPromises.unlink(filePath);
    } catch (error) {
      console.error(`删除文件失败 (${filePath}):`, error);
      // 如果文件不存在，我们就不抛出错误
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  /**
   * 将文本分割成小块
   */
  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxLength, text.length);
      
      // 尝试在句子或段落结束处分割
      if (endIndex < text.length) {
        // 查找最后一个段落结束或句号位置
        const lastParagraph = text.lastIndexOf("\n\n", endIndex);
        const lastSentence = text.lastIndexOf("。", endIndex);
        const lastPeriod = text.lastIndexOf(".", endIndex);
        
        // 选择最靠近但不超过maxLength的分割点
        const breakPoints = [lastParagraph, lastSentence, lastPeriod]
          .filter(point => point > startIndex)
          .sort((a, b) => b - a);
        
        if (breakPoints.length > 0) {
          endIndex = breakPoints[0] + 1;
        }
      }

      chunks.push(text.substring(startIndex, endIndex));
      startIndex = endIndex;
    }

    return chunks;
  }
} 