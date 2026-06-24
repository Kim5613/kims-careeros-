import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// GET: 查询指定实体的附件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: '缺少 entityType 或 entityId 参数' },
        { status: 400 }
      );
    }

    const where: any = { entityType };
    if (entityType === 'resume') {
      where.resumeId = entityId;
    } else if (entityType === 'candidate') {
      where.candidateId = entityId;
    }

    const attachments = await prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('[GET /api/attachments] 获取附件列表失败:', error);
    return NextResponse.json({ error: '获取附件列表失败' }, { status: 500 });
  }
}

// POST: 删除指定附件（同时删除磁盘文件）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少附件ID' }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json({ error: '附件不存在' }, { status: 404 });
    }

    // 删除磁盘文件
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(uploadDir, attachment.storedPath);
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }

    // 删除数据库记录
    await prisma.attachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/attachments] 删除附件失败:', error);
    return NextResponse.json({ error: '删除附件失败' }, { status: 500 });
  }
}
