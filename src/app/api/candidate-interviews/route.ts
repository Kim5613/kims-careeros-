import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all candidate interviews with candidate info
export async function GET() {
  try {
    const interviews = await prisma.candidateInterview.findMany({
      include: {
        candidate: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { interviewDate: 'desc' },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Failed to fetch candidate interviews:', error);
    return NextResponse.json(
      { error: '获取面试记录失败' },
      { status: 500 }
    );
  }
}

// POST: Create a new interview record linked to a candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      candidateId, round, interviewDate,
      interviewer, evaluation, notes
    } = body;

    if (!candidateId || !round || !interviewDate) {
      return NextResponse.json(
        { error: '候选人ID、面试轮次和面试日期为必填项' },
        { status: 400 }
      );
    }

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    const interview = await prisma.candidateInterview.create({
      data: {
        candidateId,
        round,
        interviewDate: new Date(interviewDate),
        interviewer: interviewer || null,
        evaluation: evaluation || null,
        notes: notes || null,
      },
      include: {
        candidate: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error('Failed to create interview record:', error);
    return NextResponse.json(
      { error: '创建面试记录失败' },
      { status: 500 }
    );
  }
}
