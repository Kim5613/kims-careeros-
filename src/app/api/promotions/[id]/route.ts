import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/promotions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data: body,
      include: { company: true },
    });
    return NextResponse.json(promotion);
  } catch (error) {
    console.error('[PATCH /api/promotions/[id]]', error);
    return NextResponse.json({ error: '更新晋升记录失败' }, { status: 500 });
  }
}

// DELETE /api/promotions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.promotion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/promotions/[id]]', error);
    return NextResponse.json({ error: '删除晋升记录失败' }, { status: 500 });
  }
}
