import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/todos?date=YYYY-MM-DD 或 ?month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let where: any = {};
    if (date) {
      where.date = date;
    } else if (month) {
      where.date = { startsWith: month };
    } else if (year) {
      where.date = { startsWith: year };
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('[GET /api/todos]', error);
    return NextResponse.json({ error: '获取待办失败' }, { status: 500 });
  }
}

// POST /api/todos
export async function POST(req: NextRequest) {
  try {
    const { date, title, time, color, location, description, reminder, repeat, isTodo } = await req.json();
    if (!date || !title) {
      return NextResponse.json({ error: '缺少日期或标题' }, { status: 400 });
    }
    const todo = await prisma.todo.create({
      data: {
        date,
        title,
        time: time || null,
        color: color || '#1677ff',
        location: location || null,
        description: description || null,
        reminder: reminder || null,
        repeat: repeat || null,
        isTodo: isTodo !== undefined ? isTodo : true,
      },
    });
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('[POST /api/todos]', error);
    return NextResponse.json({ error: '创建待办失败' }, { status: 500 });
  }
}
