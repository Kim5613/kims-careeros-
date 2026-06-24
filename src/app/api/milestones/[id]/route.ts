import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/milestones/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestone = await prisma.milestone.findUnique({ where: { id: params.id } });
    if (!milestone) return NextResponse.json({ error: '里程碑不存在' }, { status: 404 });
    return NextResponse.json(milestone);
  } catch (error) {
    console.error('[GET /api/milestones/[id]]', error);
    return NextResponse.json({ error: '获取里程碑失败' }, { status: 500 });
  }
}

// PATCH /api/milestones/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const milestone = await prisma.milestone.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(milestone);
  } catch (error) {
    console.error('[PATCH /api/milestones/[id]]', error);
    return NextResponse.json({ error: '更新里程碑失败' }, { status: 500 });
  }
}

// DELETE /api/milestones/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.milestone.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/milestones/[id]]', error);
    return NextResponse.json({ error: '删除里程碑失败' }, { status: 500 });
  }
}
