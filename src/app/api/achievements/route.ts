import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/achievements
// Fetch all achievements ordered by date desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(achievements, { status: 200 });
  } catch (error) {
    console.error('[GET /api/achievements] Failed to fetch achievements:', error);
    return NextResponse.json(
      { error: '获取成就数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/achievements
// Create a new achievement
// ────────────────────────────────────────────

interface CreateAchievementBody {
  title: string;
  description?: string | null;
  date: string;
  project?: string | null;
  impact?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAchievementBody = await request.json();

    // ── Validate required fields ──
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: '成就标题不能为空' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: '日期不能为空' },
        { status: 400 }
      );
    }

    // ── Create achievement ──
    const achievement = await prisma.achievement.create({
      data: {
        title: body.title.trim(),
        description: body.description ?? null,
        date: new Date(body.date),
        project: body.project ?? null,
        impact: body.impact ?? null,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('[POST /api/achievements] Failed to create achievement:', error);
    return NextResponse.json(
      { error: '创建成就失败，请稍后重试' },
      { status: 500 }
    );
  }
}
