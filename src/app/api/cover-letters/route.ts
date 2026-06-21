import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/cover-letters
// Fetch all cover letters ordered by createdAt desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(coverLetters, { status: 200 });
  } catch (error) {
    console.error('[GET /api/cover-letters] Failed to fetch cover letters:', error);
    return NextResponse.json(
      { error: '获取求职信列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/cover-letters
// Create a new cover letter
// ────────────────────────────────────────────

interface CreateCoverLetterBody {
  title: string;
  content: string;
  targetCompany?: string | null;
  targetPosition?: string | null;
  resumeId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCoverLetterBody = await request.json();

    // ── Validate required fields ──
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: '求职信标题不能为空' },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: '求职信内容不能为空' },
        { status: 400 }
      );
    }

    // ── Validate resumeId if provided ──
    if (body.resumeId) {
      const resumeExists = await prisma.resume.findUnique({
        where: { id: body.resumeId },
      });

      if (!resumeExists) {
        return NextResponse.json(
          { error: '关联的简历不存在' },
          { status: 400 }
        );
      }
    }

    // ── Create cover letter ──
    const coverLetter = await prisma.coverLetter.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        targetCompany: body.targetCompany?.trim() || null,
        targetPosition: body.targetPosition?.trim() || null,
        resumeId: body.resumeId || null,
      },
    });

    return NextResponse.json(coverLetter, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cover-letters] Failed to create cover letter:', error);
    return NextResponse.json(
      { error: '创建求职信失败，请稍后重试' },
      { status: 500 }
    );
  }
}
