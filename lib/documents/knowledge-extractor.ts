import { DeepSeekService } from "@/lib/deepseek";

// 知识点接口定义
export interface KnowledgePoint {
  title: string;        // 标题/概念
  content: string;      // 内容解释
  tags: string[];       // 相关标签
  importance: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * 从文本内容中提取知识点
 * @param text 文档文本内容
 * @param subject 学科名称
 * @returns 提取的知识点列表
 */
export async function getKnowledgePoints(
  text: string,
  subject: string
): Promise<KnowledgePoint[]> {
  try {
    // 如果文本过长，截取一部分
    const maxLength = 12000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "...[文本过长已截断]" 
      : text;

    // 构建提示词
    const prompt = `
你是一位专业的${subject}教育内容分析专家。请从以下文本中提取关键的知识点。
这些知识点将用于辅助学生备考，请确保提取的内容准确、全面且有教育价值。

对于每个知识点，请提供：
1. 标题：简短清晰的知识点名称
2. 内容：详细解释，包括定义、解释和应用场景
3. 标签：2-4个相关的关键词，用于分类和搜索
4. 重要程度：HIGH（核心重点）、MEDIUM（中等重要）或LOW（基础知识）

请以JSON格式返回，不要有任何其他文本：

[
  {
    "title": "知识点标题",
    "content": "详细内容解释",
    "tags": ["标签1", "标签2"],
    "importance": "HIGH"
  },
  ...
]

需要分析的文本内容如下：

${truncatedText}
`;

    // 调用DeepSeek API
    const response = await DeepSeekService.chat({
      messages: [
        {
          role: "system",
          content: "你是一个专业的教育内容分析工具，擅长提取文本中的关键知识点。请严格按照指定格式输出JSON。"
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // 低温度以获得更确定性的回答
      max_tokens: 4000, // 允许足够的输出长度
    });

    // 解析回复内容中的JSON
    const content = response.choices[0].message.content;
    
    // 清理可能的非JSON前缀/后缀
    const jsonContent = content.replace(/^```json\s*|\s*```$/g, '');
    
    // 解析JSON
    const knowledgePoints = JSON.parse(jsonContent);
    
    // 验证结果格式
    if (!Array.isArray(knowledgePoints)) {
      throw new Error("API返回的不是有效数组");
    }
    
    // 确保每个知识点都有所需的字段
    return knowledgePoints.map((point: any): KnowledgePoint => ({
      title: point.title || "未命名知识点",
      content: point.content || "",
      tags: Array.isArray(point.tags) ? point.tags : [],
      importance: ["HIGH", "MEDIUM", "LOW"].includes(point.importance) 
        ? point.importance as "HIGH" | "MEDIUM" | "LOW"
        : "MEDIUM"
    }));
  } catch (error) {
    console.error("知识点提取失败:", error);
    throw new Error(`知识点提取失败: ${error.message}`);
  }
}

// 将文本分割成更小的块进行处理
function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  
  // 按段落分割
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    // 如果当前块加上新段落超过最大块大小，保存当前块并开始新块
    if ((currentChunk + paragraph).length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  
  // 添加最后一个块
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// 从文本块中提取知识点
async function extractKnowledgePointsFromChunk(
  textChunk: string,
  subject: string,
  deepseekService: DeepSeekService
): Promise<KnowledgePoint[]> {
  const prompt = `我需要你作为教育专家，从以下文本内容中提取关于${subject}学科的所有重要知识点，并以JSON格式返回。

请分析以下文本内容:
"""
${textChunk}
"""

请提取所有关键知识点，并为每个知识点提供以下信息:
1. 标题 (title): 知识点的概念或名称
2. 内容 (content): 详细解释或定义
3. 标签 (tags): 3-5个相关关键词，以便于分类和搜索
4. 重要性 (importance): 从1-5的评分，5表示最重要

要求:
- 只提取与${subject}学科相关的关键内容
- 以JSON数组格式返回，不要添加其他解释
- 每个知识点独立，不要合并相关概念
- 确保解释准确清晰，适合考试备考

JSON格式示例:
[
  {
    "title": "知识点名称",
    "content": "详细解释",
    "tags": ["标签1", "标签2", "标签3"],
    "importance": 4
  }
]

请只返回JSON数组，不要有其他文字说明。`;

  // 调用AI服务获取响应
  const response = await deepseekService.getChatResponse(prompt);
  
  // 尝试解析JSON响应
  try {
    // 提取JSON部分
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.warn("未能从AI响应中提取JSON格式数据:", response);
      return [];
    }
    
    const jsonString = jsonMatch[0];
    const knowledgePoints = JSON.parse(jsonString) as KnowledgePoint[];
    
    // 验证格式
    return knowledgePoints.filter(kp => 
      kp.title && 
      kp.content && 
      Array.isArray(kp.tags) && 
      typeof kp.importance === 'number' &&
      kp.importance >= 1 && 
      kp.importance <= 5
    );
  } catch (error) {
    console.error("解析AI返回的知识点数据时出错:", error);
    return [];
  }
}

// 对知识点进行去重和排序
function deduplicateAndRankKnowledgePoints(knowledgePoints: KnowledgePoint[]): KnowledgePoint[] {
  // 创建标题映射，用于检测重复
  const titleMap = new Map<string, KnowledgePoint>();
  
  // 使用标题作为键来去重
  for (const kp of knowledgePoints) {
    const normalizedTitle = kp.title.trim().toLowerCase();
    
    // 如果这个标题已存在，保留重要性更高的或内容更丰富的
    if (titleMap.has(normalizedTitle)) {
      const existing = titleMap.get(normalizedTitle)!;
      
      if (kp.importance > existing.importance || 
          kp.content.length > existing.content.length) {
        titleMap.set(normalizedTitle, kp);
      }
    } else {
      titleMap.set(normalizedTitle, kp);
    }
  }
  
  // 按重要性降序排列
  return Array.from(titleMap.values()).sort((a, b) => b.importance - a.importance);
} 