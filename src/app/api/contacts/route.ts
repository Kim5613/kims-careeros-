import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────
// GET /api/contacts
// Fetch all contacts with linked companies
// ────────────────────────────────────────────

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error('[GET /api/contacts] Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: '获取联系人列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// POST /api/contacts
// Create a new contact with optional company links
// ────────────────────────────────────────────

interface CreateContactBody {
  name: string;
  relationType: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  notes?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContactBody = await request.json();

    // ── Validate required fields ──
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: '联系人姓名不能为空' },
        { status: 400 }
      );
    }

    if (!body.relationType || !body.relationType.trim()) {
      return NextResponse.json(
        { error: '关系类型不能为空' },
        { status: 400 }
      );
    }

    // ── Find or create company if provided ──
    let companyId: string | null = null;

    if (body.companyName && body.companyName.trim()) {
      const companyName = body.companyName.trim();

      let company = await prisma.company.findFirst({
        where: { name: companyName },
      });

      if (!company) {
        company = await prisma.company.create({
          data: { name: companyName },
        });
      }

      companyId = company.id;
    }

    // ── Create contact ──
    const contact = await prisma.contact.create({
      data: {
        name: body.name.trim(),
        relationType: body.relationType.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        wechat: body.wechat?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    // ── Link to company if applicable ──
    if (companyId) {
      await prisma.contactCompany.create({
        data: {
          contactId: contact.id,
          companyId,
        },
      });
    }

    // ── Return with relations ──
    const fullContact = await prisma.contact.findUnique({
      where: { id: contact.id },
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(fullContact, { status: 201 });
  } catch (error) {
    console.error('[POST /api/contacts] Failed to create contact:', error);
    return NextResponse.json(
      { error: '创建联系人失败，请稍后重试' },
      { status: 500 }
    );
  }
}
