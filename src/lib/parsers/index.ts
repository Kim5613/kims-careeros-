import { extractPdfText } from './pdf';
import { extractImageText } from './image';
import { extractTextContent } from './text';

/**
 * 根据 MIME 类型分发到对应的解析器
 * 返回提取出的纯文本
 */
export async function parseFile(filePath: string, mimeType: string): Promise<string> {
  // PDF
  if (mimeType === 'application/pdf') {
    return extractPdfText(filePath);
  }

  // 图片 OCR
  if (mimeType.startsWith('image/')) {
    return extractImageText(filePath);
  }

  // Markdown / 纯文本
  if (
    mimeType === 'text/markdown' ||
    mimeType === 'text/plain' ||
    filePath.endsWith('.md') ||
    filePath.endsWith('.txt')
  ) {
    return extractTextContent(filePath);
  }

  throw new Error(`不支持的文件类型: ${mimeType}`);
}
