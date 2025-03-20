import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello, World!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      message: 'Data received successfully',
      data: body,
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