import { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'Qwen/QwQ-32B';

  try {
    const body = await request.json();

    const category = body.category;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Hello, World!',
      status: 'success',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

