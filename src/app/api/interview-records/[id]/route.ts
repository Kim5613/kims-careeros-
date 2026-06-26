import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { applicationId, interviewDate, interviewType, interviewer, position, title, content, result } = body;

    const record = await prisma.interviewRecord.update({
      where: { id: params.id },
      data: {
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewType, interviewer, position, title, content, result,
      },
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error('[PATCH /api/interview-records/[id]]', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.interviewRecord.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/interview-records/[id]]', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
