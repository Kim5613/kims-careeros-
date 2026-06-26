import fs from 'fs';

/**
 * 提取 HTML 文件中的纯文本
 * 去除所有标签，保留文字内容
 */
export async function extractHtmlText(filePath: string): Promise<string> {
  const html = fs.readFileSync(filePath, 'utf-8');
  // 去除 script 和 style
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // 去除 HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 解码常见 HTML 实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // 合并多个空白
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}
