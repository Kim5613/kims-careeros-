import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/todos/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(todo);
  } catch (error) {
    console.error('[PATCH /api/todos/[id]]', error);
    return NextResponse.json({ error: '更新待办失败' }, { status: 500 });
  }
}

// DELETE /api/todos/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.todo.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/todos/[id]]', error);
    return NextResponse.json({ error: '删除待办失败' }, { status: 500 });
  }
}
