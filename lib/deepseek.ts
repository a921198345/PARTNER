import { createParser } from 'eventsource-parser';

/**
 * DeepSeek API服务类
 * 封装与DeepSeek大语言模型的交互
 */
export class DeepSeekService {
  // DeepSeek API地址
  private static apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  
  // 默认模型
  private static defaultModel = 'deepseek-chat';
  
  /**
   * 发送聊天请求到DeepSeek API
   * 
   * @param options 请求选项
   * @returns 响应对象
   */
  static async chat(options: {
    messages: { role: string; content: string }[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }) {
    const { 
      messages, 
      model = this.defaultModel, 
      temperature = 0.7, 
      max_tokens = 2000, 
      stream = false 
    } = options;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API错误: ${error.error?.message || JSON.stringify(error)}`);
      }

      return response;
    } catch (error) {
      console.error('DeepSeek请求失败:', error);
      throw error;
    }
  }

  /**
   * 处理流式响应
   * 
   * @param response 响应对象
   * @param callbacks 回调函数
   * @returns 转换后的流
   */
  static processStream(response: Response, callbacks?: {
    onCompletion?: (completion: string) => void;
  }): ReadableStream {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';

    return new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const parser = createParser((event) => {
          if (event.type === 'event') {
            if (event.data === '[DONE]') {
              if (callbacks?.onCompletion) {
                callbacks.onCompletion(buffer);
              }
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(event.data);
              const text = json.choices[0]?.delta?.content || '';
              
              if (text) {
                buffer += text;
                controller.enqueue(encoder.encode(text));
              }
            } catch (e) {
              console.error('流处理错误:', e);
              controller.error(e);
            }
          }
        });

        const reader = response.body.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (callbacks?.onCompletion) {
                callbacks.onCompletion(buffer);
              }
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            parser.feed(chunk);
          }
        } catch (e) {
          console.error('读取响应流错误:', e);
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });
  }

  /**
   * 创建嵌入向量
   * 
   * @param text 文本内容
   * @returns 向量数组
   */
  static async createEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-embedding',
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek Embedding API错误: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('创建嵌入向量失败:', error);
      throw error;
    }
  }
} 