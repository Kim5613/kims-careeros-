/**
 * GET/POST /api/pet/summon — 召唤芝士
 *
 * POST: CareerOS 页面点击小碗 → 设置召唤信号
 * GET:  桌宠定时轮询 → 检测信号 → 弹出窗口
 *       读取后信号自动清零（避免重复弹出）
 */

let summoned = false;
let summonedAt = 0;

export async function POST() {
  summoned = true;
  summonedAt = Date.now();
  return Response.json({ summoned: true, timestamp: summonedAt });
}

export async function GET() {
  const wasSummoned = summoned;
  // 读取后清零，防止桌宠反复弹出
  summoned = false;
  return Response.json({
    summoned: wasSummoned,
    timestamp: summonedAt,
  });
}
