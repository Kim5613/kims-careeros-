import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/achievements/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const achievement = await prisma.achievement.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(achievement);
  } catch (error) {
    console.error('[PATCH /api/achievements/[id]]', error);
    return NextResponse.json({ error: '更新成就失败' }, { status: 500 });
  }
}

// DELETE /api/achievements/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.achievement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/achievements/[id]]', error);
    return NextResponse.json({ error: '删除成就失败' }, { status: 500 });
  }
}
