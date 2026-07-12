import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/applications
// Fetch all job applications with company info
// ────────────────────────────────────────────

export async function GET() {
  try {
    const applications = await prisma.jobApplication.findMany({
      include: {
        company: {
          select: { id: true, name: true, industry: true, scale: true, city: true },
        },
        interviews: { orderBy: { interviewDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('[GET /api/applications] Failed to fetch applications:', error);
    return NextResponse.json(
      { error: '获取求职记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/applications
// Create a new job application
// Creates the company record if it doesn't exist
// ────────────────────────────────────────────

interface CreateApplicationBody {
  companyName: string;
  positionName: string;
  industry?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currentStage?: string;
  stageDetail?: string | null;
  source?: string | null;
  location?: string | null;
  appliedDate?: string | null;
  jdLink?: string | null;
  jdText?: string | null;
  resumeVersion?: string | null;
  endReason?: string | null;
  notes?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateApplicationBody = await request.json();

    // ── Validate required fields ──
    if (!body.companyName || !body.companyName.trim()) {
      return NextResponse.json(
        { error: '公司名称不能为空' },
        { status: 400 }
      );
    }

    if (!body.positionName || !body.positionName.trim()) {
      return NextResponse.json(
        { error: '职位名称不能为空' },
        { status: 400 }
      );
    }

    // ── Find or create company ──
    const companyName = body.companyName.trim();

    let company = await prisma.company.findFirst({
      where: { name: companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName },
      });
    }

    // ── Create job application ──
    const application = await prisma.jobApplication.create({
      data: {
        companyId: company.id,
        positionName: body.positionName.trim(),
        industry: body.industry ?? null,
        salaryMin: body.salaryMin ?? null,
        salaryMax: body.salaryMax ?? null,
        currentStage: body.currentStage ?? '未投递',
        stageDetail: body.stageDetail ?? null,
        source: body.source ?? null,
        location: body.location ?? null,
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
        jdLink: body.jdLink ?? null,
        jdText: body.jdText ?? null,
        resumeVersion: body.resumeVersion ?? null,
        endReason: body.endReason ?? null,
        notes: body.notes ?? null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            scale: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('[POST /api/applications] Failed to create application:', error);
    return NextResponse.json(
      { error: '创建求职记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
