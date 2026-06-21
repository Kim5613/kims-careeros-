import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/resumes
// Fetch all resumes ordered by createdAt desc
// ────────────────────────────────────────────

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(resumes, { status: 200 });
  } catch (error) {
    console.error('[GET /api/resumes] Failed to fetch resumes:', error);
    return NextResponse.json(
      { error: '获取简历列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/resumes
// Create a new resume
// ────────────────────────────────────────────

interface CreateResumeBody {
  title: string;
  content: string;
  targetPosition?: string | null;
  targetCompany?: string | null;
  version?: number;
  isDefault?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateResumeBody = await request.json();

    // ── Validate required fields ──
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: '简历标题不能为空' },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: '简历内容不能为空' },
        { status: 400 }
      );
    }

    // ── If setting as default, unset other defaults ──
    if (body.isDefault) {
      await prisma.resume.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // ── Create resume ──
    const resume = await prisma.resume.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        targetPosition: body.targetPosition?.trim() || null,
        targetCompany: body.targetCompany?.trim() || null,
        version: body.version ?? 1,
        isDefault: body.isDefault ?? false,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('[POST /api/resumes] Failed to create resume:', error);
    return NextResponse.json(
      { error: '创建简历失败，请稍后重试' },
      { status: 500 }
    );
  }
}
