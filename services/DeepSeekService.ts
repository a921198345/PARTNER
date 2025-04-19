import { Message } from 'ai';

/**
 * DeepSeek AI 服务
 * 处理与DeepSeek AI API的通信
 */
export class DeepSeekService {
  private static apiKey: string = process.env.DEEPSEEK_API_KEY || '';
  private static apiUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  /**
   * 生成AI响应
   * @param systemPrompt - 系统提示
   * @param messages - 消息历史
   * @returns Promise<string> - AI生成的响应
   */
  public static async generateResponse(
    systemPrompt: string,
    messages: Message[]
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('未配置DEEPSEEK_API_KEY环境变量');
      }

      // 构建请求消息
      const requestMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // 发送请求到DeepSeek API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: requestMessages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek服务错误:', error);
      return `抱歉，我暂时无法回应。技术团队正在处理这个问题。(错误: ${(error as Error).message})`;
    }
  }
} 