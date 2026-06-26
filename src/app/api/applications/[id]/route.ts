import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/applications/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = await prisma.jobApplication.findUnique({
      where: { id: params.id },
      include: { company: true, interviews: { orderBy: { interviewDate: 'desc' } }, negotiations: true },
    });
    if (!app) return NextResponse.json({ error: '求职记录不存在' }, { status: 404 });
    return NextResponse.json(app);
  } catch (error) {
    console.error('[GET /api/applications/[id]]', error);
    return NextResponse.json({ error: '获取求职记录失败' }, { status: 500 });
  }
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { companyName, ...data } = body;

    if (companyName !== undefined) {
      let company = await prisma.company.findFirst({ where: { name: companyName } });
      if (!company) {
        company = await prisma.company.create({ data: { name: companyName } });
      }
      data.companyId = company.id;
    }

    const app = await prisma.jobApplication.update({
      where: { id: params.id },
      data,
      include: { company: true, interviews: { orderBy: { interviewDate: 'desc' } } },
    });
    return NextResponse.json(app);
  } catch (error) {
    console.error('[PATCH /api/applications/[id]]', error);
    return NextResponse.json({ error: '更新求职记录失败' }, { status: 500 });
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.jobApplication.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/applications/[id]]', error);
    return NextResponse.json({ error: '删除求职记录失败' }, { status: 500 });
  }
}
