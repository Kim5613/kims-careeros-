import fs from 'fs';
import path from 'path';

/**
 * 提取 PDF 文件中的所有文本内容
 * 使用 pdfjs-dist 逐页提取，支持中文
 */
export async function extractPdfText(filePath: string): Promise<string> {
  // 动态导入 pdfjs-dist，仅在服务端使用
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    isImageDecoderSupported: false,
  }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join('');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}
