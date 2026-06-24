import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/companies/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true, candidates: true } } },
    });
    if (!company) return NextResponse.json({ error: '公司不存在' }, { status: 404 });
    return NextResponse.json(company);
  } catch (error) {
    console.error('[GET /api/companies/[id]]', error);
    return NextResponse.json({ error: '获取公司失败' }, { status: 500 });
  }
}

// PATCH /api/companies/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // 检查名称冲突
    if (body.name) {
      const existing = await prisma.company.findFirst({ where: { name: body.name } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: '公司名称已存在' }, { status: 409 });
      }
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(company);
  } catch (error) {
    console.error('[PATCH /api/companies/[id]]', error);
    return NextResponse.json({ error: '更新公司失败' }, { status: 500 });
  }
}

// DELETE /api/companies/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.company.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/companies/[id]]', error);
    return NextResponse.json({ error: '删除公司失败' }, { status: 500 });
  }
}
