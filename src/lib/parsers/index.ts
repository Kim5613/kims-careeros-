import { extractPdfText } from './pdf';
import { extractImageText } from './image';
import { extractTextContent } from './text';
import { extractWordText } from './word';
import { extractExcelText } from './excel';
import { extractHtmlText } from './html';

/**
 * 根据 MIME 类型分发到对应的解析器
 */
export async function parseFile(filePath: string, mimeType: string): Promise<string> {
  // PDF
  if (mimeType === 'application/pdf') {
    return extractPdfText(filePath);
  }

  // Word
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractWordText(filePath);
  }

  // Excel
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return extractExcelText(filePath);
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

  // HTML
  if (mimeType === 'text/html') {
    return extractHtmlText(filePath);
  }

  throw new Error(`不支持的文件类型: ${mimeType}`);
}
