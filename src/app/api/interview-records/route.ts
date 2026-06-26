import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/interview-records
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, interviewDate, interviewType, interviewer, position, title, content, result } = body;

    if (!applicationId || !interviewDate || !interviewType) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const record = await prisma.interviewRecord.create({
      data: {
        applicationId,
        interviewDate: new Date(interviewDate),
        interviewType: interviewType || '现场',
        interviewer: interviewer || null,
        position: position || null,
        title: title || null,
        content: content || null,
        result: result || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('[POST /api/interview-records]', error);
    return NextResponse.json({ error: '添加面试记录失败' }, { status: 500 });
  }
}
