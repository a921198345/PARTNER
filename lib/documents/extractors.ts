import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

// 将exec函数转换为Promise形式
const execPromise = promisify(exec);

/**
 * 从不同类型的文档中提取文本
 */
export async function extractTextFromDocument(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  // 获取文件扩展名
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".txt":
    case ".md":
      return extractFromTextFile(filePath);
    case ".pdf":
      return `[PDF文件] ${path.basename(filePath)} - 内容提取暂不可用`;
    case ".docx":
    case ".doc":
      return `[Word文件] ${path.basename(filePath)} - 内容提取暂不可用`;
    case ".rtf":
      return `[RTF文件] ${path.basename(filePath)} - 内容提取暂不可用`;
    default:
      return `[不支持的文件类型] ${path.basename(filePath)}`;
  }
}

/**
 * 从文本文件提取内容
 */
async function extractFromTextFile(filePath: string): Promise<string> {
  try {
    const content = await fsPromises.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("读取文本文件失败:", error);
    throw error;
  }
}

/**
 * 从PDF文件提取文本
 * 需要安装pdftotext工具（属于poppler-utils）
 */
async function extractFromPdf(filePath: string): Promise<string> {
  try {
    // 使用pdftotext命令行工具
    // 注意：需要在服务器上安装poppler-utils
    const { stdout } = await execPromise(`pdftotext -layout -nopgbrk "${filePath}" -`);
    return stdout;
  } catch (error) {
    console.error("从PDF中提取文本失败:", error);
    
    // 返回简单提示而不是抛出错误
    return `无法从PDF中提取文本: ${path.basename(filePath)}`;
  }
}

/**
 * 从DOCX文件提取文本
 * 此功能暂不可用，返回占位消息
 */
async function extractFromDocx(filePath: string): Promise<string> {
  // 简单返回提示信息而不是尝试使用mammoth
  return `[DOCX文件] ${path.basename(filePath)} - 内容提取暂不可用`;
}

/**
 * 从DOC文件提取文本
 * 此功能暂不可用，返回占位消息
 */
async function extractFromDoc(filePath: string): Promise<string> {
  // 简单返回提示信息
  return `[DOC文件] ${path.basename(filePath)} - 内容提取暂不可用`;
}

/**
 * 从RTF文件提取文本
 * 此功能暂不可用，返回占位消息
 */
async function extractFromRtf(filePath: string): Promise<string> {
  // 简单返回提示信息
  return `[RTF文件] ${path.basename(filePath)} - 内容提取暂不可用`;
} 