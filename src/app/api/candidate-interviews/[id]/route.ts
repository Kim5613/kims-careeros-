import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/candidate-interviews/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const interview = await prisma.candidateInterview.update({
      where: { id: params.id },
      data: body,
      include: { candidate: { include: { company: true } } },
    });
    return NextResponse.json(interview);
  } catch (error) {
    console.error('[PATCH /api/candidate-interviews/[id]]', error);
    return NextResponse.json({ error: '更新面试记录失败' }, { status: 500 });
  }
}

// DELETE /api/candidate-interviews/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.candidateInterview.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/candidate-interviews/[id]]', error);
    return NextResponse.json({ error: '删除面试记录失败' }, { status: 500 });
  }
}
