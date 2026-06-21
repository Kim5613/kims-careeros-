import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/companies
// Fetch all companies with counts of applications and candidates
// ────────────────────────────────────────────

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            applications: true,
            candidates: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Flatten _count into top-level fields for easier consumption
    const result = companies.map((company) => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      scale: company.scale,
      city: company.city,
      website: company.website,
      description: company.description,
      applicationCount: company._count.applications,
      candidateCount: company._count.candidates,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[GET /api/companies] Failed to fetch companies:', error);
    return NextResponse.json(
      { error: '获取公司列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/companies
// Create a new company
// ────────────────────────────────────────────

interface CreateCompanyBody {
  name: string;
  industry?: string | null;
  scale?: string | null;
  city?: string | null;
  website?: string | null;
  description?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyBody = await request.json();

    // ── Validate required fields ──
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: '公司名称不能为空' },
        { status: 400 }
      );
    }

    // ── Check for duplicate company name ──
    const existing = await prisma.company.findFirst({
      where: { name: body.name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `公司「${body.name.trim()}」已存在` },
        { status: 409 }
      );
    }

    // ── Create company ──
    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        industry: body.industry?.trim() || null,
        scale: body.scale?.trim() || null,
        city: body.city?.trim() || null,
        website: body.website?.trim() || null,
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        ...company,
        applicationCount: 0,
        candidateCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/companies] Failed to create company:', error);
    return NextResponse.json(
      { error: '创建公司失败，请稍后重试' },
      { status: 500 }
    );
  }
}
