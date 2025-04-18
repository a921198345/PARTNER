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
export async function extractTextFromDocument(filePath: string, extension: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  switch (extension) {
    case ".txt":
      return extractFromTextFile(filePath);
    case ".pdf":
      return extractFromPdf(filePath);
    case ".docx":
      return extractFromDocx(filePath);
    case ".doc":
      return extractFromDoc(filePath);
    case ".md":
      return extractFromTextFile(filePath);
    case ".rtf":
      return extractFromRtf(filePath);
    default:
      throw new Error(`不支持的文件类型: ${extension}`);
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
    
    // 如果命令行工具失败，尝试备用方法
    try {
      // 也可以使用npm包如pdf-parse作为备用
      // 这里作为示例，实际实现时可替换为适当的库
      throw new Error("PDF提取失败，需要安装pdftotext或使用pdf-parse库");
    } catch (backupError) {
      console.error("备用PDF提取也失败:", backupError);
      throw backupError;
    }
  }
}

/**
 * 从DOCX文件提取文本
 * 需要安装mammoth库: npm install mammoth
 */
async function extractFromDocx(filePath: string): Promise<string> {
  try {
    // 这里使用动态导入以避免在服务端不必要的依赖加载
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error("从DOCX中提取文本失败:", error);
    throw error;
  }
}

/**
 * 从DOC文件提取文本
 * 需要安装antiword或catdoc工具
 */
async function extractFromDoc(filePath: string): Promise<string> {
  try {
    // 尝试使用antiword
    const { stdout } = await execPromise(`antiword "${filePath}"`);
    return stdout;
  } catch (error) {
    console.error("使用antiword提取DOC文本失败:", error);
    
    try {
      // 备用方案：尝试使用catdoc
      const { stdout } = await execPromise(`catdoc "${filePath}"`);
      return stdout;
    } catch (backupError) {
      console.error("使用catdoc提取DOC文本也失败:", backupError);
      throw new Error("DOC文件提取失败，需要安装antiword或catdoc工具");
    }
  }
}

/**
 * 从RTF文件提取文本
 * 需要安装unrtf工具
 */
async function extractFromRtf(filePath: string): Promise<string> {
  try {
    // 使用unrtf工具提取文本
    const { stdout } = await execPromise(`unrtf --text "${filePath}"`);
    
    // unrtf输出可能包含一些header信息，尝试只获取真正的内容
    const contentStartIndex = stdout.indexOf("###########");
    if (contentStartIndex !== -1) {
      const nextLineIndex = stdout.indexOf("\n", contentStartIndex);
      if (nextLineIndex !== -1) {
        return stdout.substring(nextLineIndex + 1);
      }
    }
    
    return stdout;
  } catch (error) {
    console.error("从RTF中提取文本失败:", error);
    throw error;
  }
} 