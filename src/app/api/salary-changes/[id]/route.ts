import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/salary-changes/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const sc = await prisma.salaryChange.update({
      where: { id: params.id },
      data: body,
      include: { company: true },
    });
    return NextResponse.json(sc);
  } catch (error) {
    console.error('[PATCH /api/salary-changes/[id]]', error);
    return NextResponse.json({ error: '更新薪资记录失败' }, { status: 500 });
  }
}

// DELETE /api/salary-changes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.salaryChange.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/salary-changes/[id]]', error);
    return NextResponse.json({ error: '删除薪资记录失败' }, { status: 500 });
  }
}
