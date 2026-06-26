import * as XLSX from 'xlsx';
import fs from 'fs';

/**
 * 提取 Excel 文件内容为可读文本
 */
export async function extractExcelText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const lines: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) {
      lines.push(`[${sheetName}]`);
      lines.push(csv);
    }
  }

  return lines.join('\n\n');
}
