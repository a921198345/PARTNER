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
   */
  static async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // 模拟API响应
    console.log('DeepSeek Chat API请求:', JSON.stringify(request, null, 2));
    
    // 简单的回复生成
    const lastMessage = request.messages[request.messages.length - 1];
    let responseContent = '';
    
    if (lastMessage.content.includes('学习时长')) {
      responseContent = '你好！建议每天学习3-5小时，这样既能保证学习效果，又不会太疲劳。你想设置多少小时的学习目标呢？😊';
    } else if (lastMessage.content.includes('考试')) {
      responseContent = '关于考试，最重要的是系统性复习和做好时间规划。有什么具体问题我可以帮到你吗？📚';
    } else {
      responseContent = `我收到了你的消息："${lastMessage.content}"。有什么我可以帮助你的吗？`;
    }
    
    return {
      choices: [
        {
          message: {
            content: responseContent
          }
        }
      ]
    };
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