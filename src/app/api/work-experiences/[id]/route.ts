import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// PATCH /api/work-experiences/[id]
// ────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const experience = await prisma.workExperience.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('[PATCH /api/work-experiences/[id]]', error);
    return NextResponse.json(
      { error: '更新工作经历失败' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// DELETE /api/work-experiences/[id]
// ────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workExperience.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/work-experiences/[id]]', error);
    return NextResponse.json(
      { error: '删除工作经历失败' },
      { status: 500 }
    );
  }
}
