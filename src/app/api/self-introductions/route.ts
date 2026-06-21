import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/self-introductions
// Fetch all self introductions ordered by createdAt desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const intros = await prisma.selfIntroduction.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(intros, { status: 200 });
  } catch (error) {
    console.error('[GET /api/self-introductions] Failed to fetch self introductions:', error);
    return NextResponse.json(
      { error: '获取自我介绍话术失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/self-introductions
// Create a new self introduction
// ────────────────────────────────────────────

interface CreateSelfIntroBody {
  title: string;
  content: string;
  scenario: string;
  duration?: string | null;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSelfIntroBody = await request.json();

    // ── Validate required fields ──
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: '话术标题不能为空' },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: '话术内容不能为空' },
        { status: 400 }
      );
    }

    if (!body.scenario || !body.scenario.trim()) {
      return NextResponse.json(
        { error: '使用场景不能为空' },
        { status: 400 }
      );
    }

    // ── Validate scenario value ──
    const validScenarios = ['面试', '电话', '社交场合'];
    if (!validScenarios.includes(body.scenario)) {
      return NextResponse.json(
        { error: `无效的场景类型，请选择：${validScenarios.join('、')}` },
        { status: 400 }
      );
    }

    // ── Create self introduction ──
    const intro = await prisma.selfIntroduction.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        scenario: body.scenario.trim(),
        duration: body.duration?.trim() || null,
        tags: body.tags ?? [],
      },
    });

    return NextResponse.json(intro, { status: 201 });
  } catch (error) {
    console.error('[POST /api/self-introductions] Failed to create self introduction:', error);
    return NextResponse.json(
      { error: '创建话术失败，请稍后重试' },
      { status: 500 }
    );
  }
}
