import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/market-insights/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const insight = await prisma.marketInsight.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(insight);
  } catch (error) {
    console.error('[PATCH /api/market-insights/[id]]', error);
    return NextResponse.json({ error: '更新市场洞察失败' }, { status: 500 });
  }
}

// DELETE /api/market-insights/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.marketInsight.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/market-insights/[id]]', error);
    return NextResponse.json({ error: '删除市场洞察失败' }, { status: 500 });
  }
}
