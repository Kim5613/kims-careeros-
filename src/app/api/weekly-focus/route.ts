import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || getMonday(new Date());
    const focus = await prisma.weeklyFocus.findUnique({ where: { weekStart: week } });
    return NextResponse.json({
      workContent: focus?.workContent || '',
      personalContent: focus?.personalContent || '',
      weekStart: week,
    });
  } catch {
    return NextResponse.json({ workContent: '', personalContent: '', weekStart: getMonday(new Date()) });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { weekStart, workContent, personalContent } = await req.json();
    const data: Record<string, string> = { weekStart };
    if (workContent !== undefined) data.workContent = workContent;
    if (personalContent !== undefined) data.personalContent = personalContent;

    const focus = await prisma.weeklyFocus.upsert({
      where: { weekStart },
      update: data,
      create: { weekStart, workContent: workContent || '', personalContent: personalContent || '' },
    });

    return NextResponse.json(focus);
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
