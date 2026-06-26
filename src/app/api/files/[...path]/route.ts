import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const requestedPath = params.path.join('/');

    // 安全检查：防止路径穿越
    if (requestedPath.includes('..') || requestedPath.includes('\0')) {
      return NextResponse.json({ error: '非法路径' }, { status: 403 });
    }

    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const fullPath = path.join(uploadDir, requestedPath);

    // 确保路径在 uploads 目录下
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadDir = path.resolve(uploadDir);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: '非法路径' }, { status: 403 });
    }

    // 检查文件是否存在
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const fileBuffer = await readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentType.startsWith('image/') || contentType === 'application/pdf'
          ? 'inline'
          : `attachment; filename="${path.basename(resolvedPath)}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/files] 文件读取失败:', error);
    return NextResponse.json({ error: '文件读取失败' }, { status: 500 });
  }
}
