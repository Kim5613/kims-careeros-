/**
 * GET /api/pet/data-version — 数据版本查询
 *
 * CareerOS 前端定期轮询此接口，发现版本变化时自动重新拉取数据
 * 确保桌宠的写操作能立即反映到 Web 页面
 */

// 版本号是轮询依据，禁止静态缓存
export const dynamic = 'force-dynamic';

export async function GET() {
  // 动态导入避免循环依赖（data-version 是纯 TS，无副作用）
  const { getVersion } = await import('@/lib/ai/data-version');
  const info = getVersion();
  return Response.json(info);
}
