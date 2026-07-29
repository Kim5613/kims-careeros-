import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// PATCH /api/project-experiences/[id]
// ────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const experience = await prisma.projectExperience.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('[PATCH /api/project-experiences/[id]]', error);
    return NextResponse.json(
      { error: '更新项目经历失败' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// DELETE /api/project-experiences/[id]
// ────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.projectExperience.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/project-experiences/[id]]', error);
    return NextResponse.json(
      { error: '删除项目经历失败' },
      { status: 500 }
    );
  }
}
