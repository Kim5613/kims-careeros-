import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/cover-letters/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const cl = await prisma.coverLetter.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(cl);
  } catch (error) {
    console.error('[PATCH /api/cover-letters/[id]]', error);
    return NextResponse.json({ error: '更新求职信失败' }, { status: 500 });
  }
}

// DELETE /api/cover-letters/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.coverLetter.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/cover-letters/[id]]', error);
    return NextResponse.json({ error: '删除求职信失败' }, { status: 500 });
  }
}
