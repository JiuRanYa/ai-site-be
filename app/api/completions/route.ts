import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'Qwen/QwQ-32B';

  try {
    const body = await request.json();
    
    // 确保消息数组存在，如果没有则使用默认消息
    const message = body.message || 'hello'
    
    // 其他可选参数
    const temperature = body.temperature || 0.7;
    const max_tokens = body.max_tokens || 512;
    const top_p = body.top_p || 0.7;
    const top_k = body.top_k || 50;
    const frequency_penalty = body.frequency_penalty || 0.5;

    // 检查是否有 API 密钥
    const apiKey = config.services.siliconFlow.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { 
          message: 'Silicon Flow API key is not configured',
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
        model: model,
        stream: false,
        max_tokens: max_tokens,
        temperature: temperature,
        top_p: top_p,
        top_k: top_k,
        frequency_penalty: frequency_penalty,
        n: 1,
        messages: [
          {
            "content":" 你是一个句子补全专家，请根据用户输入的句子，补全句子。请直接返回补全后的句子，不要输出任何解释。回复中请不要带有任何换行符。",
            "role":"system"
          },
          {"content":message,"role":"user"}, 
        ]
      })
    };
    
    const baseUrl = config.services.siliconFlow.baseUrl;
    const response = await fetch(`${baseUrl}/chat/completions`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          message: 'Error from Silicon Flow API',
          status: 'error',
          error: errorData
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();

    return NextResponse.json({
      message: data.choices[0].message.content,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Error processing request',
        status: 'error',
        error: (error as Error).message 
      },
      { status: 400 }
    );
  }
}