/**
 * GET /api/pet/notifications — 主动提醒检测
 *
 * 桌宠定时轮询此接口，返回当前应触发的提醒列表。
 * 根据调参面板设置决定哪些提醒生效。
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'src/data/pet-settings.json');

interface PetSettings {
  notifications: Record<string, boolean>;
}

function getSettings(): PetSettings | null {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const settings = getSettings();
  const enabled = settings?.notifications || {};

  const notifications: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    data?: unknown;
  }> = [];

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // ── 1. 日程提醒（面试/会议前 30 分钟）──
  if (enabled.scheduleReminder !== false) {
    const upcoming = await prisma.todo.findMany({
      where: {
        date: today,
        time: { not: null },
        completed: false,
      },
    });

    for (const todo of upcoming) {
      if (!todo.time) continue;
      const [h, m] = todo.time.split(':').map(Number);
      const todoTime = new Date(now);
      todoTime.setHours(h, m, 0, 0);
      const diffMin = (todoTime.getTime() - now.getTime()) / 60000;

      // 30 分钟内且还没过
      if (diffMin > 0 && diffMin <= 30) {
        notifications.push({
          type: 'schedule_reminder',
          priority: 'high',
          message: `⏰ ${todo.title} 还有 ${Math.round(diffMin)} 分钟`,
          data: { todoId: todo.id, time: todo.time },
        });
      }
    }

    // 面试提醒
    const upcomingInterviews = await prisma.interviewRecord.findMany({
      where: { interviewDate: { gte: now } },
      include: { application: { select: { company: { select: { name: true } }, positionName: true } } },
      orderBy: { interviewDate: 'asc' },
      take: 5,
    });

    for (const iv of upcomingInterviews) {
      const diffMin = (new Date(iv.interviewDate).getTime() - now.getTime()) / 60000;
      if (diffMin > 0 && diffMin <= 30) {
        notifications.push({
          type: 'schedule_reminder',
          priority: 'high',
          message: `🎯 ${iv.application?.company.name || '?'} ${iv.application?.positionName || ''} 面试还有 ${Math.round(diffMin)} 分钟，要准备吗？`,
          data: { interviewId: iv.id },
        });
      }
    }
  }

  // ── 2. 待办积压（连续 3 天）──
  if (enabled.todoBacklog !== false) {
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

    const backlog = await prisma.todo.findMany({
      where: {
        date: { lt: today, gte: threeDaysAgoStr },
        completed: false,
      },
      orderBy: { date: 'asc' },
    });

    if (backlog.length >= 3) {
      const oldest = backlog[0];
      const days = Math.ceil((now.getTime() - new Date(oldest.date).getTime()) / 86400000);
      notifications.push({
        type: 'todo_backlog',
        priority: 'medium',
        message: `你已经 ${days} 天没清待办了，积压了 ${backlog.length} 项。"${oldest.title}" 还在原地躺着。`,
        data: { count: backlog.length, oldestTitle: oldest.title },
      });
    }
  }

  // ── 3. 每日早安（当天第一次）──
  if (enabled.dailyGreeting !== false) {
    const todayTodos = await prisma.todo.findMany({
      where: { date: today },
    });
    const incomplete = todayTodos.filter((t) => !t.completed);
    const withTime = incomplete.filter((t) => t.time);

    const greeting = `早上好~ 今天有 ${incomplete.length} 件事等着你`;
    const detail = withTime.length > 0
      ? `，${withTime[0].time} ${withTime[0].title}`
      : '';

    notifications.push({
      type: 'daily_greeting',
      priority: 'low',
      message: greeting + detail + '。加油！🧀',
      data: { totalTodos: todayTodos.length, incompleteCount: incomplete.length },
    });
  }

  // ── 4. 每周复盘（周日晚上）──
  if (enabled.weeklyReview !== false) {
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    if (dayOfWeek === 0 && hour >= 20) {
      // 计算本周数据
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      const weekStartStr = weekStart.toISOString().slice(0, 10);

      const weekTodos = await prisma.todo.findMany({
        where: { date: { gte: weekStartStr, lte: today } },
      });
      const completed = weekTodos.filter((t) => t.completed).length;

      const weekApps = await prisma.jobApplication.count({
        where: { updatedAt: { gte: weekStart } },
      });

      notifications.push({
        type: 'weekly_review',
        priority: 'medium',
        message: `周日啦~ 本周完成了 ${completed}/${weekTodos.length} 项待办，投递了 ${weekApps} 个岗位。要不要聊聊这周的感受？`,
        data: { completed, total: weekTodos.length, applications: weekApps },
      });
    }
  }

  // ── 5. 数据变化（投递状态更新）──
  if (enabled.dataChange !== false) {
    // 检查最近 1 小时内的状态变更
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const recentChanges = await prisma.jobApplication.findMany({
      where: {
        updatedAt: { gte: oneHourAgo },
        currentStage: { in: ['面试', 'offer'] },
      },
      include: { company: { select: { name: true } } },
      take: 3,
    });

    for (const app of recentChanges) {
      const emoji = app.currentStage === 'offer' ? '🎉' : '📩';
      notifications.push({
        type: 'data_change',
        priority: 'high',
        message: `${emoji} ${app.company.name} ${app.positionName} 状态更新：${app.currentStage}！`,
        data: { applicationId: app.id, company: app.company.name, stage: app.currentStage },
      });
    }
  }

  // ── 6. 情绪感知（由桌面端本地处理，这里只返回是否启用）──
  // 情绪感知在客户端实现——分析用户输入的语气

  return NextResponse.json({
    notifications,
    timestamp: now.toISOString(),
    settings: {
      emotionSenseEnabled: enabled.emotionSense !== false,
    },
  });
}
