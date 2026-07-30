import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// PATCH /api/project-experiences/[id]
// ────────────────────────────────────────────

// 可更新字段白名单（防止未知字段导致 Prisma 抛错 / 任意字段写入）
const PATCHABLE_FIELDS = [
  'projectName', 'companyName', 'position',
  'startDate', 'endDate', 'process', 'results', 'tags', 'sortOrder',
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const data: Record<string, unknown> = {};
    for (const key of PATCHABLE_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: '没有可更新的字段' }, { status: 400 });
    }

    const experience = await prisma.projectExperience.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(experience);
  } catch (error) {
    // Prisma P2025：记录不存在
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: '项目经历不存在' }, { status: 404 });
    }
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
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: '项目经历不存在' }, { status: 404 });
    }
    console.error('[DELETE /api/project-experiences/[id]]', error);
    return NextResponse.json(
      { error: '删除项目经历失败' },
      { status: 500 }
    );
  }
}
