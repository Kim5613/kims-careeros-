import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────
// GET /api/project-experiences?resumeId=xxx
// 按简历 ID 获取项目经历列表
// ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return NextResponse.json(
        { error: '缺少 resumeId 参数' },
        { status: 400 }
      );
    }

    const experiences = await prisma.projectExperience.findMany({
      where: { resumeId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(experiences, { status: 200 });
  } catch (error) {
    console.error('[GET /api/project-experiences]', error);
    return NextResponse.json(
      { error: '获取项目经历失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/project-experiences
// 新增一条项目经历
// ────────────────────────────────────────────

interface CreateProjExpBody {
  resumeId: string;
  projectName: string;
  companyName: string;
  position?: string | null;
  startDate: string;
  endDate: string;
  process: string;
  results: string;
  sortOrder?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjExpBody = await request.json();

    // ── 必填字段验证 ──
    if (!body.resumeId) {
      return NextResponse.json({ error: '缺少简历 ID' }, { status: 400 });
    }
    if (!body.projectName || !body.projectName.trim()) {
      return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
    }
    if (!body.companyName || !body.companyName.trim()) {
      return NextResponse.json({ error: '公司名称不能为空' }, { status: 400 });
    }
    if (!body.startDate) {
      return NextResponse.json({ error: '开始时间不能为空' }, { status: 400 });
    }
    if (!body.endDate) {
      return NextResponse.json({ error: '结束时间不能为空' }, { status: 400 });
    }

    // ── 计算 sortOrder ──
    let sortOrder = body.sortOrder ?? 0;
    if (!body.sortOrder) {
      const max = await prisma.projectExperience.findFirst({
        where: { resumeId: body.resumeId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (max?.sortOrder ?? -1) + 1;
    }

    const experience = await prisma.projectExperience.create({
      data: {
        resumeId: body.resumeId,
        projectName: body.projectName.trim(),
        companyName: body.companyName.trim(),
        position: body.position?.trim() || null,
        startDate: body.startDate,
        endDate: body.endDate,
        process: body.process?.trim() || '',
        results: body.results?.trim() || '',
        sortOrder,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('[POST /api/project-experiences]', error);
    return NextResponse.json(
      { error: '创建项目经历失败，请稍后重试' },
      { status: 500 }
    );
  }
}
