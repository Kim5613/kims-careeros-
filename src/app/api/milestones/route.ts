import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/milestones
// Fetch all milestones ordered by date desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(milestones, { status: 200 });
  } catch (error) {
    console.error('[GET /api/milestones] Failed to fetch milestones:', error);
    return NextResponse.json(
      { error: '获取里程碑数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/milestones
// Create a new milestone
// ────────────────────────────────────────────

interface CreateMilestoneBody {
  date: string;
  title: string;
  description?: string | null;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMilestoneBody = await request.json();

    // ── Validate required fields ──
    if (!body.date) {
      return NextResponse.json(
        { error: '日期不能为空' },
        { status: 400 }
      );
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    // ── Create milestone ──
    const milestone = await prisma.milestone.create({
      data: {
        date: new Date(body.date),
        title: body.title.trim(),
        description: body.description ?? null,
        tags: body.tags ?? [],
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('[POST /api/milestones] Failed to create milestone:', error);
    return NextResponse.json(
      { error: '创建里程碑失败，请稍后重试' },
      { status: 500 }
    );
  }
}
