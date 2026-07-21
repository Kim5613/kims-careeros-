/**
 * AI 上下文构建器 — 每次对话时注入的实时数据
 */

import { prisma } from '@/lib/prisma';

export interface ChatContext {
  today: string;
  dayOfWeek: string;
  todaySchedule: string;
  upcomingInterviews: string;
  recentApplications: string;
  weeklyFocus: string;
  quickStats: string;
}

export async function buildContext(userMessage?: string): Promise<string> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const dayOfWeek = dayNames[now.getDay()];

  // 并行查询
  const [todos, interviews, applications, weeklyFocus, recentMemories] = await Promise.all([
    prisma.todo.findMany({
      where: { date: today },
      orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.interviewRecord.findMany({
      where: { interviewDate: { gte: now } },
      include: {
        application: {
          select: { company: { select: { name: true } }, positionName: true },
        },
      },
      orderBy: { interviewDate: 'asc' },
      take: 5,
    }),
    prisma.jobApplication.findMany({
      where: { currentStage: { in: ['已投递', '面试'] } },
      include: { company: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.weeklyFocus.findFirst({
      where: { weekStart: getWeekStart(now) },
    }),
    // 检索相关记忆（keyword 匹配 + 最近记忆）
    prisma.petMemory.findMany({
      where: userMessage ? {
        OR: [
          { keywords: { hasSome: extractKeywords(userMessage) } },
          { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      } : {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    }),
  ]);

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  // 今日日程摘要
  let schedule = '';
  if (incompleteTodos.length === 0) {
    schedule = '今日暂无待办事项。';
  } else {
    const withTime = incompleteTodos.filter((t) => t.time);
    const withoutTime = incompleteTodos.filter((t) => !t.time);
    schedule = `今日共 ${incompleteTodos.length} 项待办（已完成 ${completedTodos.length} 项）。`;
    if (withTime.length > 0) {
      schedule += `\n有具体时间的日程：${withTime.map((t) => `${t.time} ${t.title}`).join('、')}。`;
    }
    if (withoutTime.length > 0) {
      schedule += `\n待办事项：${withoutTime.map((t) => t.title).join('、')}。`;
    }
  }

  // 即将面试
  let interviewStr = '';
  if (interviews.length > 0) {
    interviewStr = interviews
      .map((iv) => {
        const d = new Date(iv.interviewDate);
        const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
        return `${d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} ${iv.application?.company.name || '?'} ${iv.application?.positionName || ''}（${diffDays}天后）`;
      })
      .join('；');
  } else {
    interviewStr = '暂无即将面试';
  }

  // 进行中的投递
  let appStr = '';
  if (applications.length > 0) {
    appStr = applications
      .map((a) => `${a.company.name} ${a.positionName} [${a.currentStage}]`)
      .join('；');
  } else {
    appStr = '暂无进行中的投递';
  }

  // 本周重点
  let focusStr = '';
  if (weeklyFocus && (weeklyFocus.workContent || weeklyFocus.personalContent)) {
    const parts: string[] = [];
    if (weeklyFocus.workContent) parts.push(`工作：${weeklyFocus.workContent}`);
    if (weeklyFocus.personalContent) parts.push(`个人：${weeklyFocus.personalContent}`);
    focusStr = parts.join(' | ');
  } else {
    focusStr = '未设置本周重点';
  }

  // 记忆摘要
  let memoryStr = '';
  if (recentMemories.length > 0) {
    const grouped: Record<string, string[]> = {};
    for (const m of recentMemories) {
      const typeLabel = { preference: '偏好', fact: '背景', event: '做过', decision: '决定' }[m.type] || m.type;
      if (!grouped[typeLabel]) grouped[typeLabel] = [];
      grouped[typeLabel].push(m.content);
    }
    memoryStr = '\n## 你对 Kim 的了解（长期记忆）\n';
    for (const [label, items] of Object.entries(grouped)) {
      memoryStr += `- [${label}] ${items.join('；')}\n`;
    }
    memoryStr += '\n请自然地运用这些记忆，让对话有连续性。不确定的记忆不要编造，可以问 Kim 确认。';
  }

  return `## 当前上下文
- 今天是 ${today}（周${dayOfWeek}）
- 今日日程：${schedule}
- 即将面试：${interviewStr}
- 进行中投递：${appStr}
- 本周重点：${focusStr}${memoryStr}`;
}

/** 从用户消息中提取关键词，用于记忆检索 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['我', '你', '的', '了', '是', '在', '有', '和', '就', '不', '也', '都', '要', '会', '个', '吗', '呢', '吧', '啊', '什么', '怎么', '哪', '哪', '帮', '给', '让', '把', '被', '从', '到', '对', '跟', '向', '为', '因为', '所以', '如果', '虽然', '但是', '可以', '需要', '应该', '已经', '还', '没', '很', '这', '那', '去', '来', '做', '说', '看', '想', '知道', '觉得', '告诉', '问', '现在', '今天', '明天', '昨天', '最近', '之前', '之后']);
  const words = text.split(/[\s，。！？,.!?\-\+]/).filter(Boolean);
  const keywords: string[] = [];
  for (const w of words) {
    if (w.length >= 2 && !stopWords.has(w) && !keywords.includes(w)) {
      keywords.push(w);
      if (keywords.length >= 5) break;
    }
  }
  return keywords;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
