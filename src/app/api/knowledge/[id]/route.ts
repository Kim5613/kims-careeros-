import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/knowledge/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const knowledge = await prisma.positionKnowledge.update({
      where: { id: params.id },
      data: body,
      include: { company: true },
    });
    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('[PATCH /api/knowledge/[id]]', error);
    return NextResponse.json({ error: '更新知识条目失败' }, { status: 500 });
  }
}

// DELETE /api/knowledge/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.positionKnowledge.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/knowledge/[id]]', error);
    return NextResponse.json({ error: '删除知识条目失败' }, { status: 500 });
  }
}
