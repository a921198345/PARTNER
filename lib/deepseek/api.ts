import OpenAI from "openai";

// 初始化DeepSeek API客户端
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com/v1",
});

/**
 * 从文本中提取知识点
 * @param text 需要提取知识点的原始文本
 * @param subject 学科名称
 * @returns 结构化的知识点数组
 */
export async function extractKnowledgePoints(text: string, subject: string): Promise<KnowledgePoint[]> {
  try {
    // 构建提示词
    const prompt = `
你是一位专业的${subject}学科知识提取专家。请从以下文本中提取关键知识点，并按照以下JSON格式输出：

[
  {
    "title": "知识点标题",
    "content": "知识点详细内容",
    "importance": 5 // 1-5的重要性评分，5为最重要
  }
]

要求：
1. 只提取真正重要的知识点
2. 知识点标题应简明扼要
3. 知识点内容应详细完整
4. 按照重要性进行评分
5. 严格遵守上述JSON格式
6. 确保JSON格式有效可解析

以下是需要提取知识点的文本：

${text}
`;

    // 调用DeepSeek API
    const completion = await deepseekClient.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: "你是一位专业的学科知识提取专家，擅长从文本中提取结构化的知识点。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // 较低的温度以获得更加确定性的输出
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    // 解析响应
    const responseContent = completion.choices[0]?.message?.content || "[]";
    
    try {
      // 尝试直接解析JSON
      const jsonResponse = JSON.parse(responseContent);
      
      // 如果响应是一个对象，且有包含数组的字段，尝试提取数组
      if (Array.isArray(jsonResponse)) {
        return jsonResponse;
      } else if (jsonResponse.knowledgePoints && Array.isArray(jsonResponse.knowledgePoints)) {
        return jsonResponse.knowledgePoints;
      } else {
        // 找到响应中的任何数组
        for (const key in jsonResponse) {
          if (Array.isArray(jsonResponse[key])) {
            return jsonResponse[key];
          }
        }
      }
      
      console.error("无法提取知识点数组，使用空数组");
      return [];
    } catch (parseError) {
      console.error("解析API响应失败:", parseError);
      
      // 尝试使用正则表达式提取JSON数组
      const arrayMatch = responseContent.match(/\[\s*{[\s\S]*}\s*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (error) {
          console.error("提取JSON数组失败:", error);
        }
      }
      
      return [];
    }
  } catch (error) {
    console.error("调用DeepSeek API失败:", error);
    throw error;
  }
}

/**
 * 知识点结构定义
 */
export interface KnowledgePoint {
  title: string;
  content: string;
  importance: number;
}

/**
 * 使用DeepSeek API总结文本
 */
export async function summarizeText(text: string, maxLength: number = 200): Promise<string> {
  try {
    const prompt = `请简洁地总结以下文本，不超过${maxLength}个字：\n\n${text}`;
    
    const completion = await deepseekClient.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: "你是一位专业的文本总结专家，擅长提炼关键信息。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("文本总结失败:", error);
    return text.substring(0, maxLength) + "...";
  }
} 