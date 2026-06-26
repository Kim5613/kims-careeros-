import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const LOGO_DIR = path.join(import.meta.dirname, '..', 'public', 'logos');

const files = fs.readdirSync(LOGO_DIR).filter((f) => f.endsWith('.png'));

for (const file of files) {
  const inputPath = path.join(LOGO_DIR, file);
  const outputPath = path.join(LOGO_DIR, file.replace('.png', '_透明.png'));

  console.log(`处理: ${file}`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  const { width, height, channels } = info;

  // 遍历每个像素，将白色/近白色设为透明
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // RGB 都 > 200 视为白色背景，设为透明
    if (r > 200 && g > 200 && b > 200) {
      pixels[i + 3] = 0; // alpha = 0
    }
  }

  await sharp(pixels, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  // 替换原文件
  fs.unlinkSync(inputPath);
  fs.renameSync(outputPath, inputPath);

  console.log(`  ✓ 完成`);
}

console.log('\n全部处理完成！');
