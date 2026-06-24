import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/resumes/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
      include: { attachments: true },
    });
    if (!resume) return NextResponse.json({ error: '简历不存在' }, { status: 404 });
    return NextResponse.json(resume);
  } catch (error) {
    console.error('[GET /api/resumes/[id]]', error);
    return NextResponse.json({ error: '获取简历失败' }, { status: 500 });
  }
}

// PATCH /api/resumes/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // 如果设为默认，先取消其他默认
    if (body.isDefault) {
      await prisma.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }

    const resume = await prisma.resume.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(resume);
  } catch (error) {
    console.error('[PATCH /api/resumes/[id]]', error);
    return NextResponse.json({ error: '更新简历失败' }, { status: 500 });
  }
}

// DELETE /api/resumes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.resume.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/resumes/[id]]', error);
    return NextResponse.json({ error: '删除简历失败' }, { status: 500 });
  }
}
