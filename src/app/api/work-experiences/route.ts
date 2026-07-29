import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────
// GET /api/work-experiences?resumeId=xxx
// 按简历 ID 获取工作经历列表
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

    const experiences = await prisma.workExperience.findMany({
      where: { resumeId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(experiences, { status: 200 });
  } catch (error) {
    console.error('[GET /api/work-experiences]', error);
    return NextResponse.json(
      { error: '获取工作经历失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/work-experiences
// 新增一条工作经历
// ────────────────────────────────────────────

interface CreateWorkExpBody {
  resumeId: string;
  companyName: string;
  baseLocation?: string | null;
  position: string;
  startDate: string;
  endDate: string;
  coreWork: string;
  sortOrder?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkExpBody = await request.json();

    // ── 必填字段验证 ──
    if (!body.resumeId) {
      return NextResponse.json({ error: '缺少简历 ID' }, { status: 400 });
    }
    if (!body.companyName || !body.companyName.trim()) {
      return NextResponse.json({ error: '公司名称不能为空' }, { status: 400 });
    }
    if (!body.position || !body.position.trim()) {
      return NextResponse.json({ error: '岗位名称不能为空' }, { status: 400 });
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
      const max = await prisma.workExperience.findFirst({
        where: { resumeId: body.resumeId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (max?.sortOrder ?? -1) + 1;
    }

    const experience = await prisma.workExperience.create({
      data: {
        resumeId: body.resumeId,
        companyName: body.companyName.trim(),
        baseLocation: body.baseLocation?.trim() || null,
        position: body.position.trim(),
        startDate: body.startDate,
        endDate: body.endDate,
        coreWork: body.coreWork?.trim() || '',
        sortOrder,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('[POST /api/work-experiences]', error);
    return NextResponse.json(
      { error: '创建工作经历失败，请稍后重试' },
      { status: 500 }
    );
  }
}
