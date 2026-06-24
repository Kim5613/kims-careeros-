import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/self-introductions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const si = await prisma.selfIntroduction.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(si);
  } catch (error) {
    console.error('[PATCH /api/self-introductions/[id]]', error);
    return NextResponse.json({ error: '更新话术失败' }, { status: 500 });
  }
}

// DELETE /api/self-introductions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.selfIntroduction.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/self-introductions/[id]]', error);
    return NextResponse.json({ error: '删除话术失败' }, { status: 500 });
  }
}
