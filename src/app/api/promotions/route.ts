import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/promotions
// Fetch all promotions with company info
// ────────────────────────────────────────────

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
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
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(promotions, { status: 200 });
  } catch (error) {
    console.error('[GET /api/promotions] Failed to fetch promotions:', error);
    return NextResponse.json(
      { error: '获取晋升记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/promotions
// Create a new promotion record
// Creates the company record if it doesn't exist
// ────────────────────────────────────────────

interface CreatePromotionBody {
  date: string;
  previousLevel?: string | null;
  newLevel?: string | null;
  companyName: string;
  reason?: string | null;
  summary?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePromotionBody = await request.json();

    // ── Validate required fields ──
    if (!body.date) {
      return NextResponse.json(
        { error: '晋升日期不能为空' },
        { status: 400 }
      );
    }

    if (!body.companyName || !body.companyName.trim()) {
      return NextResponse.json(
        { error: '公司名称不能为空' },
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

    // ── Create promotion ──
    const promotion = await prisma.promotion.create({
      data: {
        date: new Date(body.date),
        previousLevel: body.previousLevel ?? null,
        newLevel: body.newLevel ?? null,
        companyId: company.id,
        reason: body.reason ?? null,
        summary: body.summary ?? null,
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

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('[POST /api/promotions] Failed to create promotion:', error);
    return NextResponse.json(
      { error: '创建晋升记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
