import path from 'path';

/**
 * 使用 tesseract.js 对图片进行 OCR 识别
 * 支持中文 (chi_sim) + 英文 (eng)
 */
export async function extractImageText(filePath: string): Promise<string> {
  const Tesseract = await import('tesseract.js');

  const result = await Tesseract.recognize(filePath, 'chi_sim+eng', {
    // 本地缓存语言数据，避免每次下载
    cachePath: path.join(process.env.UPLOAD_DIR || 'uploads', 'tesseract-cache'),
  });

  return result.data.text;
}
