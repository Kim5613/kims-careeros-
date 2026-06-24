import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contacts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: { companies: { include: { company: true } } },
    });
    if (!contact) return NextResponse.json({ error: '联系人不存在' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error) {
    console.error('[GET /api/contacts/[id]]', error);
    return NextResponse.json({ error: '获取联系人失败' }, { status: 500 });
  }
}

// PATCH /api/contacts/[id]
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
      await prisma.contactCompany.upsert({
        where: { contactId_companyId: { contactId: params.id, companyId: company.id } },
        create: { contactId: params.id, companyId: company.id },
        update: {},
      });
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data,
      include: { companies: { include: { company: true } } },
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error('[PATCH /api/contacts/[id]]', error);
    return NextResponse.json({ error: '更新联系人失败' }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/contacts/[id]]', error);
    return NextResponse.json({ error: '删除联系人失败' }, { status: 500 });
  }
}
