/**
 * GET/PUT /api/pet/settings — 芝士调参面板接口
 * 数据存储在 JSON 文件，免数据库迁移
 */

import { NextRequest, NextResponse } from 'next/server';
import { readPetSettings, writePetSettings } from '@/lib/pet-settings';

// 设置是用户可改的，禁止静态缓存
export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = readPetSettings();
  if (!settings) {
    return NextResponse.json({ error: '配置文件读取失败' }, { status: 500 });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readPetSettings();
    if (!current) {
      return NextResponse.json({ error: '配置文件读取失败' }, { status: 500 });
    }
    // 深度合并
    const merged = deepMerge(current, body);
    writePetSettings(merged);
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (target[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>,
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
