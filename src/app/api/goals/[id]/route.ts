import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/goals/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const goal = await prisma.goalOKR.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('[PATCH /api/goals/[id]]', error);
    return NextResponse.json({ error: '更新目标失败' }, { status: 500 });
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.goalOKR.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/goals/[id]]', error);
    return NextResponse.json({ error: '删除目标失败' }, { status: 500 });
  }
}
