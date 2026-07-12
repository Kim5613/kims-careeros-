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
    const { companyName, companyScale, companyCity, companyWebsite, ...data } = body;

    // Handle date conversion
    if (data.appliedDate && typeof data.appliedDate === 'string') {
      data.appliedDate = new Date(data.appliedDate);
    }

    // Update company info
    if (companyName !== undefined) {
      let company = await prisma.company.findFirst({ where: { name: companyName } });
      if (!company) {
        company = await prisma.company.create({ data: { name: companyName } });
      }
      // Update company detail fields if provided
      const coUpdates: any = {};
      if (companyScale !== undefined) coUpdates.scale = companyScale || null;
      if (companyCity !== undefined) coUpdates.city = companyCity || null;
      if (companyWebsite !== undefined) coUpdates.website = companyWebsite || null;
      if (Object.keys(coUpdates).length > 0) {
        await prisma.company.update({ where: { id: company.id }, data: coUpdates });
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
