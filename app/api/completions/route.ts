import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 确保消息存在
    const message = body.message || '';
    if (!message) {
      return NextResponse.json(
        { 
          error: '消息不能为空',
          status: 'error'
        },
        { status: 400 }
      );
    }
    
    // 其他可选参数
    const temperature = 0.7;  // 保持适度的创造性
    const max_tokens = 1000;  // 允许更长的回复
    const top_p = 0.9;       // 提高回复的多样性
    const frequency_penalty = 0.5;  // 减少重复

    // 检查是否有 API 密钥
    const apiKey = config.services.siliconFlow.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Silicon Flow API key is not configured',
          status: 'error'
        },
        { status: 500 }
      );
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/QwQ-32B',
        stream: false,
        max_tokens: max_tokens,
        temperature: temperature,
        top_p: top_p,
        frequency_penalty: frequency_penalty,
        n: 1,
        messages: [
          {
            "role": "system",
            "content": `你是 Nexus AI 导航站的智能客服助手。你需要：
1. 帮助用户了解和使用 Nexus AI 导航站
2. 回答用户关于 AI 工具、模型和应用的问题
3. 提供友好、专业的服务态度
4. 如果不确定的问题，诚实地表示不知道
5. 保持回答简洁明了，避免过长的说明
6. 使用用户的语言进行回复，语气友好自然`
          },
          {
            "role": "user",
            "content": message
          }
        ]
      })
    };
    
    const baseUrl = config.services.siliconFlow.baseUrl;
    const response = await fetch(`${baseUrl}/chat/completions`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: '对话服务暂时不可用，请稍后再试',
          status: 'error',
          details: errorData
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();

    return NextResponse.json({
      message: data.choices[0].message.content,
      status: 'success'
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        error: '处理请求时出错',
        status: 'error',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}