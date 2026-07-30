import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/battle-projects
export async function GET() {
  try {
    const projects = await prisma.battleProject.findMany({
      include: {
        company: { select: { id: true, name: true, industry: true, scale: true, background: true } },
        skills: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('[GET /api/battle-projects]', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
}

// POST /api/battle-projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required
    if (!body.companyId) return NextResponse.json({ error: '请选择公司' }, { status: 400 });
    if (!body.projectName?.trim()) return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
    if (!body.role?.trim()) return NextResponse.json({ error: '项目岗位不能为空' }, { status: 400 });
    if (!body.startDate) return NextResponse.json({ error: '开始时间不能为空' }, { status: 400 });

    // ── 处理 workExperienceId ──
    const workExperienceId = body.workExperienceId || null;

    // Sync company editable fields (industry, scale, background)
    const coUpdates: any = {};
    if (body.company_industry !== undefined) coUpdates.industry = body.company_industry || null;
    if (body.company_scale !== undefined) coUpdates.scale = body.company_scale || null;
    if (body.company_background !== undefined) coUpdates.background = body.company_background || null;
    if (Object.keys(coUpdates).length > 0) {
      await prisma.company.update({ where: { id: body.companyId }, data: coUpdates });
    }

    const { skills: skillsData, company_industry, company_scale, company_background, ...projectData } = body;

    const project = await prisma.battleProject.create({
      data: {
        companyId: body.companyId,
        workExperienceId,
        projectName: body.projectName.trim(),
        role: body.role.trim(),
        startDate: body.startDate,
        endDate: body.endDate ?? null,
        origin: body.origin ?? null,
        goal: body.goal ?? null,
        reportTo: body.reportTo ?? null,
        teamSize: body.teamSize ?? null,
        departments: body.departments ?? null,
        duration: body.duration ?? null,
        phase1: body.phase1 ?? null,
        phase2: body.phase2 ?? null,
        phase3: body.phase3 ?? null,
        results: body.results ?? null,
        shortcomings: body.shortcomings ?? null,
      },
    });

    // ── 能力沉淀技能落库（与 PATCH 同款逻辑；原来解构出来却没写库，新建丢技能）──
    if (Array.isArray(skillsData) && skillsData.length > 0) {
      await prisma.battleProjectSkill.createMany({
        data: skillsData.map((s: any) => ({
          projectId: project.id,
          skillId: s.skillId,
          skillName: s.skillName,
          category: s.category ?? 'hard',
          level: s.level ?? 3,
          description: s.description ?? null,
          targetLevel: s.targetLevel ?? null,
        })),
      });
    }

    // 重新查询以带上 skills 返回
    const created = await prisma.battleProject.findUnique({
      where: { id: project.id },
      include: {
        company: { select: { id: true, name: true, industry: true, scale: true, background: true } },
        skills: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/battle-projects]', error);
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 });
  }
}
