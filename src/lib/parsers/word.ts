import mammoth from 'mammoth';

/**
 * 提取 Word (.docx) 文件中的文本
 */
export async function extractWordText(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
