import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/salary-changes
// Fetch all salary changes with company info
// ────────────────────────────────────────────

export async function GET() {
  try {
    const salaryChanges = await prisma.salaryChange.findMany({
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

    return NextResponse.json(salaryChanges, { status: 200 });
  } catch (error) {
    console.error('[GET /api/salary-changes] Failed to fetch salary changes:', error);
    return NextResponse.json(
      { error: '获取涨薪记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/salary-changes
// Create a new salary change record
// Creates the company record if it doesn't exist
// ────────────────────────────────────────────

interface CreateSalaryChangeBody {
  date: string;
  amount: number;
  changeType: string;
  companyName: string;
  notes?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSalaryChangeBody = await request.json();

    // ── Validate required fields ──
    if (!body.date) {
      return NextResponse.json(
        { error: '生效日期不能为空' },
        { status: 400 }
      );
    }

    if (body.amount == null || body.amount <= 0) {
      return NextResponse.json(
        { error: '薪资金额必须大于 0' },
        { status: 400 }
      );
    }

    if (!body.changeType || !body.changeType.trim()) {
      return NextResponse.json(
        { error: '调薪类型不能为空' },
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

    // ── Create salary change ──
    const salaryChange = await prisma.salaryChange.create({
      data: {
        date: new Date(body.date),
        amount: body.amount,
        changeType: body.changeType.trim(),
        companyId: company.id,
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

    return NextResponse.json(salaryChange, { status: 201 });
  } catch (error) {
    console.error('[POST /api/salary-changes] Failed to create salary change:', error);
    return NextResponse.json(
      { error: '创建涨薪记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
