import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/candidates/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: { company: true, interviews: { orderBy: { round: 'asc' } }, attachments: true },
    });
    if (!candidate) return NextResponse.json({ error: '候选人不存在' }, { status: 404 });
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('[GET /api/candidates/[id]]', error);
    return NextResponse.json({ error: '获取候选人失败' }, { status: 500 });
  }
}

// PATCH /api/candidates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { companyName, ...data } = body;

    // 处理公司关联
    if (companyName !== undefined) {
      let company = await prisma.company.findFirst({ where: { name: companyName } });
      if (!company) {
        company = await prisma.company.create({ data: { name: companyName } });
      }
      data.companyId = company.id;
    }

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data,
      include: { company: true, interviews: { orderBy: { round: 'asc' } } },
    });
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('[PATCH /api/candidates/[id]]', error);
    return NextResponse.json({ error: '更新候选人失败' }, { status: 500 });
  }
}

// DELETE /api/candidates/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.candidate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/candidates/[id]]', error);
    return NextResponse.json({ error: '删除候选人失败' }, { status: 500 });
  }
}
