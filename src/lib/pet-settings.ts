/**
 * 桌宠设置读写 — 统一存储位置
 *
 * 不能写在 src/data/（代码目录）：server-deploy.sh 每次部署
 * git checkout + git clean 会把用户设置重置/删除。
 * 生产环境写到 /data/careeros-uploads/（部署脚本已创建该目录），
 * 本地开发目录不存在时回退 src/data/。
 */

import fs from 'fs';
import path from 'path';

const LOCAL_PATH = path.join(process.cwd(), 'src/data', 'pet-settings.json');
const SERVER_DIR = process.env.PET_DATA_DIR || '/data/careeros-uploads';

function resolvePath(): string {
  try {
    if (fs.existsSync(SERVER_DIR)) return path.join(SERVER_DIR, 'pet-settings.json');
  } catch { /* 无权限等异常一律回退本地 */ }
  return LOCAL_PATH;
}

export function readPetSettings(): Record<string, unknown> | null {
  // 优先读持久化位置；还没有（首次运行）则读代码里的默认配置
  for (const p of [resolvePath(), LOCAL_PATH]) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch { /* 尝试下一个 */ }
  }
  return null;
}

export function writePetSettings(data: unknown): void {
  const p = resolvePath();
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}
