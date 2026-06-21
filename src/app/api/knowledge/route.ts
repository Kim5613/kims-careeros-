import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all position knowledge with company
export async function GET() {
  try {
    const knowledge = await prisma.positionKnowledge.findMany({
      include: {
        company: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Failed to fetch knowledge:', error);
    return NextResponse.json(
      { error: '获取知识库数据失败' },
      { status: 500 }
    );
  }
}

// POST: Create a new knowledge entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyId, positionCategory, terminology, jdTemplate,
      evaluationCriteria, salaryRangeMin, salaryRangeMax,
      marketInfo, notes
    } = body;

    if (!positionCategory) {
      return NextResponse.json(
        { error: '岗位分类为必填项' },
        { status: 400 }
      );
    }

    const knowledge = await prisma.positionKnowledge.create({
      data: {
        companyId: companyId || null,
        positionCategory,
        terminology: terminology || null,
        jdTemplate: jdTemplate || null,
        evaluationCriteria: evaluationCriteria || null,
        salaryRangeMin: salaryRangeMin || null,
        salaryRangeMax: salaryRangeMax || null,
        marketInfo: marketInfo || null,
        notes: notes || null,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(knowledge, { status: 201 });
  } catch (error) {
    console.error('Failed to create knowledge entry:', error);
    return NextResponse.json(
      { error: '创建知识条目失败' },
      { status: 500 }
    );
  }
}
