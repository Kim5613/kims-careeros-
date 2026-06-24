import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface ActivityItem {
  time: string;
  content: string;
  tag: string;
  tagColor: string;
  dotColor: string;
}

export async function GET() {
  try {
    const activities: ActivityItem[] = [];

    // 候选人
    const recentCandidates = await prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    for (const c of recentCandidates) {
      activities.push({
        time: c.createdAt.toISOString(),
        content: `新增候选人：${c.name}${c.position ? ` — ${c.position}` : ''}`,
        tag: '候选人',
        tagColor: 'purple',
        dotColor: 'purple',
      });
    }

    // 求职记录
    const recentApps = await prisma.jobApplication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
    for (const a of recentApps) {
      activities.push({
        time: a.createdAt.toISOString(),
        content: `新增求职记录 — ${a.company?.name || '未知公司'}·${a.positionName}`,
        tag: '求职',
        tagColor: 'blue',
        dotColor: 'blue',
      });
    }

    // 晋升
    const recentPromotions = await prisma.promotion.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
    for (const p of recentPromotions) {
      activities.push({
        time: p.createdAt.toISOString(),
        content: `晋升记录：${p.previousLevel || '?'} → ${p.newLevel || '?'} @ ${p.company?.name || ''}`,
        tag: '晋升',
        tagColor: 'gold',
        dotColor: 'gold',
      });
    }

    // 薪资变化
    const recentSalary = await prisma.salaryChange.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
    for (const s of recentSalary) {
      activities.push({
        time: s.createdAt.toISOString(),
        content: `薪资变动：${s.changeType} ${s.amount ? `${(s.amount / 1000).toFixed(0)}k` : ''} @ ${s.company?.name || ''}`,
        tag: '薪酬',
        tagColor: 'orange',
        dotColor: 'orange',
      });
    }

    // 里程碑
    const recentMilestones = await prisma.milestone.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    for (const m of recentMilestones) {
      activities.push({
        time: m.createdAt.toISOString(),
        content: `里程碑：${m.title}`,
        tag: '里程碑',
        tagColor: 'green',
        dotColor: 'green',
      });
    }

    // 成就
    const recentAchievements = await prisma.achievement.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    for (const a of recentAchievements) {
      activities.push({
        time: a.createdAt.toISOString(),
        content: `成就达成：${a.title}`,
        tag: '成就',
        tagColor: 'cyan',
        dotColor: 'cyan',
      });
    }

    // 知识库
    const recentKnowledge = await prisma.positionKnowledge.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    for (const k of recentKnowledge) {
      activities.push({
        time: k.createdAt.toISOString(),
        content: `新增招聘知识：${k.positionCategory}`,
        tag: '知识库',
        tagColor: 'cyan',
        dotColor: 'cyan',
      });
    }

    // 市场洞察
    const recentInsights = await prisma.marketInsight.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    for (const i of recentInsights) {
      activities.push({
        time: i.createdAt.toISOString(),
        content: `市场洞察：${i.title}`,
        tag: '洞察',
        tagColor: 'magenta',
        dotColor: 'magenta',
      });
    }

    // 按时间排序，取最近 15 条
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const top15 = activities.slice(0, 15);

    // 格式化时间为相对时间
    const now = Date.now();
    const formatted = top15.map((item) => {
      const diff = now - new Date(item.time).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      let displayTime: string;
      if (minutes < 1) displayTime = '刚刚';
      else if (minutes < 60) displayTime = `${minutes}分钟前`;
      else if (hours < 24) displayTime = `今天 ${String(new Date(item.time).getHours()).padStart(2, '0')}:${String(new Date(item.time).getMinutes()).padStart(2, '0')}`;
      else if (days === 1) displayTime = '昨天';
      else if (days < 7) displayTime = `${days}天前`;
      else displayTime = new Date(item.time).toLocaleDateString('zh-CN');

      return { ...item, time: displayTime };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('[GET /api/dashboard/activity]', error);
    // 返回空数组作为 fallback
    return NextResponse.json([]);
  }
}
