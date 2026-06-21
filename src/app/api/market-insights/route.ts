import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all market insights ordered by createdAt desc
export async function GET() {
  try {
    const insights = await prisma.marketInsight.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Failed to fetch market insights:', error);
    return NextResponse.json(
      { error: '获取市场洞察失败' },
      { status: 500 }
    );
  }
}

// POST: Create a new market insight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title, content, category, industry,
      position, dataPoints, source
    } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '标题、内容和分类为必填项' },
        { status: 400 }
      );
    }

    const insight = await prisma.marketInsight.create({
      data: {
        title,
        content,
        category,
        industry: industry || null,
        position: position || null,
        dataPoints: dataPoints || null,
        source: source || null,
      },
    });

    return NextResponse.json(insight, { status: 201 });
  } catch (error) {
    console.error('Failed to create market insight:', error);
    return NextResponse.json(
      { error: '创建市场洞察失败' },
      { status: 500 }
    );
  }
}
