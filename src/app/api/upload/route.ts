import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// 允许的文件类型
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'text/markdown',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.md', '.txt'];

// 最大文件大小：20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;

    // 验证必填参数
    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }
    if (!entityType || !entityId) {
      return NextResponse.json({ error: '缺少实体类型或ID' }, { status: 400 });
    }
    if (!['resume', 'candidate'].includes(entityType)) {
      return NextResponse.json({ error: '不支持的实体类型' }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件大小不能超过 20MB' }, { status: 400 });
    }

    // 验证文件类型
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: '不支持的文件格式，仅支持 PDF、JPG、PNG、Markdown' },
        { status: 400 }
      );
    }

    // 推断 MIME 类型（以扩展名为准，更可靠）
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
    };
    const mimeType = mimeMap[ext] || file.type;

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }

    // 生成存储路径
    const uuid = randomUUID();
    const storedFileName = `${uuid}${ext}`;
    const entityDir = entityType === 'resume' ? 'resumes' : 'candidates';
    const relativePath = path.join(entityDir, entityId, storedFileName);

    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const fullDir = path.join(uploadDir, entityDir, entityId);
    const fullPath = path.join(uploadDir, relativePath);

    // 创建目录
    await mkdir(fullDir, { recursive: true });

    // 读取文件并写入磁盘
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(fullPath, buffer);

    // 创建数据库记录
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.name,
        storedPath: relativePath.replace(/\\/g, '/'), // 统一使用 / 分隔符
        mimeType,
        size: file.size,
        entityType,
        resumeId: entityType === 'resume' ? entityId : null,
        candidateId: entityType === 'candidate' ? entityId : null,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('[POST /api/upload] 文件上传失败:', error);
    return NextResponse.json({ error: '文件上传失败，请稍后重试' }, { status: 500 });
  }
}
