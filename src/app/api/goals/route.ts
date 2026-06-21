import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/goals
// Fetch all OKR goals ordered by creation date desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const goals = await prisma.goalOKR.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error('[GET /api/goals] Failed to fetch goals:', error);
    return NextResponse.json(
      { error: '获取目标数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/goals
// Create a new OKR goal
// ────────────────────────────────────────────

interface CreateGoalBody {
  objective: string;
  keyResults?: string | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateGoalBody = await request.json();

    // ── Validate required fields ──
    if (!body.objective || !body.objective.trim()) {
      return NextResponse.json(
        { error: '目标描述不能为空' },
        { status: 400 }
      );
    }

    // ── Create goal ──
    const goal = await prisma.goalOKR.create({
      data: {
        objective: body.objective.trim(),
        keyResults: body.keyResults ?? null,
        status: body.status ?? '进行中',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        progress: body.progress ?? 0,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('[POST /api/goals] Failed to create goal:', error);
    return NextResponse.json(
      { error: '创建目标失败，请稍后重试' },
      { status: 500 }
    );
  }
}
