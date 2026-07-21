import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { parseFile } from '@/lib/parsers';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED = new Map([
  ['.pdf', 'application/pdf'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.doc', 'application/msword'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.md', 'text/markdown'],
  ['.txt', 'text/plain'],
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件不能超过 20MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const mimeType = ALLOWED.get(ext);
    if (!mimeType) {
      return NextResponse.json(
        { error: `不支持的文件格式 "${ext}"，支持 PDF/Word/图片/Markdown/纯文本` },
        { status: 400 }
      );
    }

    // 保存到临时目录
    const tmpDir = process.env.UPLOAD_DIR
      ? path.join(process.env.UPLOAD_DIR, 'tmp')
      : path.join('/tmp', 'careeros-parse');
    await mkdir(tmpDir, { recursive: true });

    const tmpName = `${randomUUID()}${ext}`;
    const tmpPath = path.join(tmpDir, tmpName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpPath, buffer);

    // 解析
    let parsedText: string;
    try {
      parsedText = await parseFile(tmpPath, mimeType);
    } catch (parseErr: any) {
      // 清理临时文件
      await unlink(tmpPath).catch(() => {});
      return NextResponse.json(
        { error: `文件解析失败: ${parseErr.message || '未知错误'}` },
        { status: 422 }
      );
    }

    // 清理临时文件
    await unlink(tmpPath).catch(() => {});

    if (!parsedText || !parsedText.trim()) {
      return NextResponse.json(
        { error: '未能从文件中提取到文字内容，请确认文件不是空白或纯图片扫描件（可尝试手动粘贴）' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      filename: file.name,
      mimeType,
      text: parsedText.trim(),
      charCount: parsedText.trim().length,
    });
  } catch (error: any) {
    console.error('[parse/resume] Error:', error);
    return NextResponse.json({ error: '解析失败，请稍后重试' }, { status: 500 });
  }
}
