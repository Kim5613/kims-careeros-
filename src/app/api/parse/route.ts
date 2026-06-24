import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parsers';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attachmentId } = body;

    if (!attachmentId) {
      return NextResponse.json({ error: '缺少附件ID' }, { status: 400 });
    }

    // 查询附件信息
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ error: '附件不存在' }, { status: 404 });
    }

    // 拼接文件完整路径
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(uploadDir, attachment.storedPath);

    // 调用解析器
    const parsedText = await parseFile(filePath, attachment.mimeType);

    // 保存解析结果到数据库
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { parsedText },
    });

    // 同时更新关联实体的内容
    if (attachment.entityType === 'candidate' && attachment.candidateId) {
      await prisma.candidate.update({
        where: { id: attachment.candidateId },
        data: { resumeSnapshot: parsedText },
      });
    } else if (attachment.entityType === 'resume' && attachment.resumeId) {
      await prisma.resume.update({
        where: { id: attachment.resumeId },
        data: { content: parsedText },
      });
    }

    return NextResponse.json({
      success: true,
      parsedText,
      attachmentId,
    });
  } catch (error: any) {
    console.error('[POST /api/parse] 文档解析失败:', error);
    return NextResponse.json(
      { error: `文档解析失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
