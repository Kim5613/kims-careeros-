import fs from 'fs';

/**
 * 直接读取 Markdown / 纯文本文件内容
 */
export async function extractTextContent(filePath: string): Promise<string> {
  return fs.readFileSync(filePath, 'utf-8');
}
