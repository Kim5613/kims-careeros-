import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parsers';
import path from 'path';

/**
 * 解析文件并返回文本，不写入数据库
 * POST /api/parse/preview
 * Body: { attachmentId }
 * Returns: { parsedText }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attachmentId } = body;

    if (!attachmentId) {
      return NextResponse.json({ error: '缺少附件ID' }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ error: '附件不存在' }, { status: 404 });
    }

    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(uploadDir, attachment.storedPath);

    const parsedText = await parseFile(filePath, attachment.mimeType);

    return NextResponse.json({ parsedText });
  } catch (error: any) {
    console.error('[POST /api/parse/preview]', error);
    return NextResponse.json(
      { error: `文档解析失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
