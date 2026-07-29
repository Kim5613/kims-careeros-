import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/personal-info
// 获取个人信息（单例），无记录时返回空对象
// ────────────────────────────────────────────

export async function GET() {
  try {
    const info = await prisma.personalInfo.findFirst();
    if (!info) {
      return NextResponse.json({
        name: '', phone: '', email: '', school: '', major: '',
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('[GET /api/personal-info]', error);
    return NextResponse.json(
      { error: '获取个人信息失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/personal-info
// Upsert 个人信息（创建或更新单例记录）
// ────────────────────────────────────────────

interface UpsertPersonalInfoBody {
  name?: string;
  phone?: string;
  email?: string;
  school?: string;
  major?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpsertPersonalInfoBody = await request.json();

    // 验证姓名必填
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: '姓名不能为空' },
        { status: 400 }
      );
    }

    const existing = await prisma.personalInfo.findFirst();

    let result;
    if (existing) {
      result = await prisma.personalInfo.update({
        where: { id: existing.id },
        data: {
          name: body.name?.trim() ?? existing.name,
          phone: body.phone?.trim() ?? existing.phone,
          email: body.email?.trim() ?? existing.email,
          school: body.school?.trim() ?? existing.school,
          major: body.major?.trim() ?? existing.major,
        },
      });
    } else {
      result = await prisma.personalInfo.create({
        data: {
          name: body.name.trim(),
          phone: body.phone?.trim() ?? '',
          email: body.email?.trim() ?? '',
          school: body.school?.trim() ?? '',
          major: body.major?.trim() ?? '',
        },
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/personal-info]', error);
    return NextResponse.json(
      { error: '保存个人信息失败，请稍后重试' },
      { status: 500 }
    );
  }
}
