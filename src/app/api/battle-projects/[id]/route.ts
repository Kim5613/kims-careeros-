import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/battle-projects/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.battleProject.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { id: true, name: true, industry: true, scale: true, background: true } },
        skills: true,
      },
    });
    if (!project) return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error('[GET /api/battle-projects/[id]]', error);
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 });
  }
}

// PATCH /api/battle-projects/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { skills: skillsData, company_industry, company_scale, company_background, ...projectData } = body;

    // Sync company editable fields
    if (projectData.companyId) {
      const coUpdates: any = {};
      if (company_industry !== undefined) coUpdates.industry = company_industry || null;
      if (company_scale !== undefined) coUpdates.scale = company_scale || null;
      if (company_background !== undefined) coUpdates.background = company_background || null;
      if (Object.keys(coUpdates).length > 0) {
        await prisma.company.update({ where: { id: projectData.companyId }, data: coUpdates });
      }
    }

    const project = await prisma.battleProject.update({
      where: { id: params.id },
      data: projectData,
    });

    // Replace skills if passed
    if (Array.isArray(skillsData)) {
      await prisma.battleProjectSkill.deleteMany({ where: { projectId: params.id } });
      if (skillsData.length > 0) {
        await prisma.battleProjectSkill.createMany({
          data: skillsData.map((s: any) => ({
            projectId: params.id,
            skillId: s.skillId,
            skillName: s.skillName,
            category: s.category ?? 'hard',
            level: s.level ?? 3,
            description: s.description ?? null,
            targetLevel: s.targetLevel ?? null,
          })),
        });
      }
    }

    const refreshed = await prisma.battleProject.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { id: true, name: true, industry: true, scale: true, background: true } },
        skills: true,
      },
    });
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error('[PATCH /api/battle-projects/[id]]', error);
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 });
  }
}

// DELETE /api/battle-projects/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.battleProject.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/battle-projects/[id]]', error);
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 });
  }
}
