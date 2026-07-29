import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ── HTML → 纯文本，<li> → 编号要点 ──
function stripHtml(html: string): string {
  if (!html) return '';
  let text = html
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"');

  // 转换 • 为编号
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let counter = 0;
  const numbered = lines.map((l) => {
    if (l.startsWith('•')) {
      counter++;
      return `${counter}. ${l.replace(/^•\s*/, '')}`;
    }
    counter = 0; // 遇到非要点行（如小节标题）时重置计数
    return l;
  });
  return numbered.join('\n');
}

// ── 三段式过程拼接 ──
function formatProcess(phase1?: string | null, phase2?: string | null, phase3?: string | null): string {
  const parts: string[] = [];
  if (phase1?.trim()) parts.push(`【调研/规划】\n${stripHtml(phase1)}`);
  if (phase2?.trim()) parts.push(`【执行】\n${stripHtml(phase2)}`);
  if (phase3?.trim()) parts.push(`【收尾】\n${stripHtml(phase3)}`);
  return parts.join('\n\n');
}

// ────────────────────────────────────────────
// POST /api/battle-projects/[id]/sync-to-resume
// 把内部战役项目映射为简历项目经历
// ────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: '请指定目标简历版本' }, { status: 400 });
    }

    // 1. 查 BattleProject
    const battle = await prisma.battleProject.findUnique({
      where: { id: params.id },
      include: { company: { select: { name: true } } },
    });

    if (!battle) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    // 2. 防重复：同 resumeId + 同 projectName 已存在则拒绝
    const existing = await prisma.projectExperience.findFirst({
      where: { resumeId, projectName: battle.projectName },
    });
    if (existing) {
      return NextResponse.json(
        { error: `该项目已同步到该简历版本（"${existing.projectName}"），请勿重复同步` },
        { status: 409 }
      );
    }

    // 3. 字段映射
    const process = formatProcess(battle.phase1, battle.phase2, battle.phase3);
    const results = battle.results?.trim() ? stripHtml(battle.results) : '';

    // 4. 计算 sortOrder
    const max = await prisma.projectExperience.findFirst({
      where: { resumeId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const sortOrder = (max?.sortOrder ?? -1) + 1;

    // 5. 创建 ProjectExperience
    const created = await prisma.projectExperience.create({
      data: {
        resumeId,
        projectName: battle.projectName,
        companyName: battle.company?.name ?? '',
        position: battle.role,
        startDate: battle.startDate,
        endDate: battle.endDate ?? '至今',
        process,
        results,
        tags: battle.tags || [],
        sortOrder,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/battle-projects/[id]/sync-to-resume]', error);
    return NextResponse.json(
      { error: '同步失败，请稍后重试' },
      { status: 500 }
    );
  }
}
