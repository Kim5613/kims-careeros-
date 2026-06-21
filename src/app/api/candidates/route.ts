import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all candidates with company and interviews
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        company: true,
        interviews: {
          orderBy: { round: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    return NextResponse.json(
      { error: '获取候选人列表失败' },
      { status: 500 }
    );
  }
}

// POST: Create a new candidate with company lookup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name, phone, email, companyName, position, skills,
      experienceYears, source, resumeSnapshot, notes,
      status, offerSalary, followUpStatus, talentPoolTag
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: '候选人姓名为必填项' },
        { status: 400 }
      );
    }

    // Look up or create company
    let companyId: string | null = null;
    if (companyName) {
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

    const candidate = await prisma.candidate.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        companyId,
        position: position || null,
        skills: skills || [],
        experienceYears: experienceYears || null,
        source: source || null,
        resumeSnapshot: resumeSnapshot || null,
        notes: notes || null,
        status: status || '待筛选',
        offerSalary: offerSalary || null,
        followUpStatus: followUpStatus || null,
        talentPoolTag: talentPoolTag || false,
      },
      include: {
        company: true,
        interviews: true,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Failed to create candidate:', error);
    return NextResponse.json(
      { error: '创建候选人失败' },
      { status: 500 }
    );
  }
}
