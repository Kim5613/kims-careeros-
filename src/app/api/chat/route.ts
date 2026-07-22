/**
 * POST /api/chat — AI 桌宠对话接口
 *
 * 使用 Vercel AI SDK v7 + DeepSeek + 工具调用
 * 流式 SSE 响应
 */

import { streamText, tool, isStepCount } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { buildContext } from '@/lib/ai/context';
import { searchWeb, fetchPage } from '@/lib/ai/search';
import { bumpVersion } from '@/lib/ai/data-version';

// ============================================================
// 工具定义（内联 — 后续可提取到 tools.ts）
// ============================================================

const TOOLS = {
  // ── 日程工具 ──
  getTodaySchedule: tool({
    description: '获取今天的待办事项和日程安排，包括已完成和未完成的。在 Kim 问"今天有什么安排""今天有什么事""看下今天的日程"时调用。',
    inputSchema: z.object({}),
    execute: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const todos = await prisma.todo.findMany({
        where: { date: today },
        orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
      });
      const incomplete = todos.filter((t) => !t.completed);
      const completed = todos.filter((t) => t.completed);
      return {
        total: todos.length,
        incomplete: incomplete.length,
        completed: completed.length,
        withTime: incomplete.filter((t) => t.time).map((t) => ({
          id: t.id, title: t.title, time: t.time, category: t.category, color: t.color,
        })),
        withoutTime: incomplete.filter((t) => !t.time).map((t) => ({
          id: t.id, title: t.title, category: t.category, color: t.color,
        })),
        completedList: completed.slice(0, 5).map((t) => ({ id: t.id, title: t.title })),
      };
    },
  }),

  createTodo: tool({
    description: '创建一个新的待办事项或日程。如果 Kim 说"帮我加一个""新增""记录一下""记一个待办"就调用此工具。',
    inputSchema: z.object({
      title: z.string().describe('待办/日程的标题'),
      date: z.string().optional().describe('日期，格式 YYYY-MM-DD，默认为今天'),
      time: z.string().optional().describe('具体时间，格式 HH:mm。如果有时间则是日程，无时间是待办'),
      category: z.enum(['work', 'personal']).optional().describe('分类：work=工作，personal=个人'),
      color: z.string().optional().describe('十六进制颜色代码，如 #1677ff'),
      description: z.string().optional().describe('详细描述或备注'),
    }),
    execute: async ({ title, date, time, category, color, description }) => {
      const todo = await prisma.todo.create({
        data: {
          title,
          date: date || new Date().toISOString().slice(0, 10),
          time: time || null,
          category: category || null,
          color: color || '#1677ff',
          description: description || null,
          isTodo: !time,
        },
      });
      bumpVersion('todos');
      return { id: todo.id, title: todo.title, date: todo.date, time: todo.time, category: todo.category, created: true };
    },
  }),
  completeTodo: tool({
    description: '标记一个待办事项为已完成。当 Kim 说"完成了""做完了""标记完成""搞定"时调用。需要提供待办的 ID。',
    inputSchema: z.object({
      id: z.string().describe('要完成的待办 ID'),
    }),
    execute: async ({ id }) => {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) return { error: '未找到该待办' };
      await prisma.todo.update({ where: { id }, data: { completed: true } });
      bumpVersion('todos');
      return { id: todo.id, title: todo.title, completed: true };
    },
  }),

  getWeeklyOverview: tool({
    description: '获取本周的日程概览，按天统计完成情况。当 Kim 问"本周情况""这周怎么样""周报"时调用。',
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const mondayStr = monday.toISOString().slice(0, 10);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sundayStr = sunday.toISOString().slice(0, 10);
      const todos = await prisma.todo.findMany({
        where: { date: { gte: mondayStr, lte: sundayStr } },
        orderBy: { date: 'asc' },
      });
      const byDay: Record<string, { total: number; completed: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        byDay[d.toISOString().slice(0, 10)] = { total: 0, completed: 0 };
      }
      for (const t of todos) {
        if (byDay[t.date]) { byDay[t.date].total++; if (t.completed) byDay[t.date].completed++; }
      }
      return { byDay, totalTodos: todos.length, completedTodos: todos.filter((t) => t.completed).length, range: `${mondayStr} ~ ${sundayStr}` };
    },
  }),

  // ── 数据查询工具 ──
  searchCompanies: tool({
    description: '搜索公司数据库。当 Kim 问"有哪些公司""查一下XX公司""XX行业的公司"时调用。',
    inputSchema: z.object({
      keyword: z.string().describe('搜索关键词（公司名/行业/城市）'),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ keyword, limit = 5 }) => {
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { industry: { contains: keyword, mode: 'insensitive' } },
            { city: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      return companies.map((c) => ({ id: c.id, name: c.name, industry: c.industry, scale: c.scale, city: c.city, description: c.description?.slice(0, 200) }));
    },
  }),

  searchContacts: tool({
    description: '搜索人脉库。当 Kim 问"认识谁""联系谁""XX行业的人脉""猎头"时调用。',
    inputSchema: z.object({
      keyword: z.string().describe('搜索关键词（姓名/关系类型/标签/备注中的内容）'),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ keyword, limit = 5 }) => {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { relationType: { contains: keyword, mode: 'insensitive' } },
            { tags: { has: keyword } },
            { notes: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      return contacts.map((c) => ({
        id: c.id, name: c.name, relationType: c.relationType, tags: c.tags,
        phone: c.phone, email: c.email, wechat: c.wechat,
        lastInteractionDate: c.lastInteractionDate, notes: c.notes?.slice(0, 200),
      }));
    },
  }),

  getJobApplications: tool({
    description: '查看投递记录。当 Kim 问"投了哪些""投递情况""申请状态""还在面哪些"时调用。可按状态筛选。',
    inputSchema: z.object({
      status: z.string().optional().describe('按状态筛选：未投递/已投递/面试/offer/已结束。不传则返回全部'),
      limit: z.number().optional().default(10),
    }),
    execute: async ({ status, limit = 10 }) => {
      const where: Record<string, unknown> = {};
      if (status) where.currentStage = status;
      const apps = await prisma.jobApplication.findMany({
        where,
        include: { company: { select: { name: true, industry: true } } },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      return apps.map((a) => ({
        id: a.id, company: a.company.name, industry: a.company.industry,
        position: a.positionName, stage: a.currentStage, stageDetail: a.stageDetail,
        location: a.location, salaryMin: a.salaryMin, salaryMax: a.salaryMax,
        source: a.source, appliedDate: a.appliedDate, notes: a.notes?.slice(0, 200),
      }));
    },
  }),

  getUpcomingInterviews: tool({
    description: '查看即将到来的面试安排。当 Kim 问"接下来有什么面试""面试安排""明天面试"时调用。',
    inputSchema: z.object({}),
    execute: async () => {
      const interviews = await prisma.interviewRecord.findMany({
        where: { interviewDate: { gte: new Date() } },
        include: { application: { select: { company: { select: { name: true } }, positionName: true } } },
        orderBy: { interviewDate: 'asc' },
        take: 10,
      });
      return interviews.map((iv) => ({
        id: iv.id, date: iv.interviewDate, type: iv.interviewType,
        company: iv.application?.company.name || '未知', position: iv.application?.positionName || iv.position,
        interviewer: iv.interviewer, notes: iv.notes?.slice(0, 200),
      }));
    },
  }),

  searchKnowledge: tool({
    description: '搜索招聘知识库。当 Kim 问"面经""面试题""怎么评估""JD模板""XX岗位的知识"时调用。',
    inputSchema: z.object({
      keyword: z.string().describe('搜索关键词（岗位名/公司名/知识点）'),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ keyword, limit = 5 }) => {
      const items = await prisma.positionKnowledge.findMany({
        where: {
          OR: [
            { positionCategory: { contains: keyword, mode: 'insensitive' } },
            { terminology: { contains: keyword, mode: 'insensitive' } },
            { evaluationCriteria: { contains: keyword, mode: 'insensitive' } },
            { notes: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        include: { company: { select: { name: true } } },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      return items.map((k) => ({
        id: k.id, category: k.positionCategory, company: k.company?.name,
        terminology: k.terminology?.slice(0, 300),
        evaluationCriteria: k.evaluationCriteria?.slice(0, 300),
        notes: k.notes?.slice(0, 200),
      }));
    },
  }),

  searchMarketInsights: tool({
    description: '搜索市场洞察数据，包括薪酬对标、人才趋势、行业动态。当 Kim 问"市场行情""薪资水平""行业趋势""薪酬对标"时调用。',
    inputSchema: z.object({
      keyword: z.string().optional().describe('搜索关键词'),
      category: z.string().optional().describe('分类筛选：薪酬对标/人才趋势/行业动态'),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ keyword, category, limit = 5 }) => {
      const where: Record<string, unknown> = {};
      if (keyword) {
        where.OR = [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
        ];
      }
      if (category) where.category = category;
      const items = await prisma.marketInsight.findMany({ where, take: limit, orderBy: { updatedAt: 'desc' } });
      return items.map((m) => ({
        id: m.id, title: m.title, category: m.category, industry: m.industry, position: m.position,
        content: m.content?.slice(0, 500), source: m.source,
      }));
    },
  }),

  // ── 联网搜索工具（Phase 2） ──
  searchWeb: tool({
    description: '实时联网搜索网页。当 Kim 问的是需要实时信息、最新动态、市场行情、新闻、面经等 CareerOS 数据库里没有的内容时调用。优先于 searchKnowledge/searchMarketInsights 使用。例如："字节最新面经""HRBP 今年薪资行情""AI 招聘工具推荐"。返回标题、链接和摘要。',
    inputSchema: z.object({
      query: z.string().describe('搜索关键词，建议用中文'),
      limit: z.number().optional().default(5).describe('返回结果数量，默认 5 条'),
    }),
    execute: async ({ query, limit = 5 }) => {
      return await searchWeb(query, limit);
    },
  }),

  fetchPage: tool({
    description: '抓取指定网页的纯文本内容。适用于深度研究场景：先用 searchWeb 获取链接，再挑选感兴趣的链接用 fetchPage 抓取全文进行深入分析。单次返回最多 6000 字符。',
    inputSchema: z.object({
      url: z.string().describe('要抓取的网页完整 URL，如 https://example.com/article'),
    }),
    execute: async ({ url }) => {
      const content = await fetchPage(url);
      return { url, content, length: content.length };
    },
  }),

  // ── 长期记忆工具（Phase 2.5 — AI OS Framework "做即记"原则） ──
  saveMemory: tool({
    description: `保存一条重要信息到芝士的长期记忆。仅在以下情况调用，不要滥用：
✅ 必须记：Kim 说了偏好（喜欢/不喜欢什么）、分享了个人信息（在面XX公司、换工作了等）、做了决策（"我决定XX"）、芝士亲自执行了操作（创建待办/完成待办）→ 记下来
❌ 不记：一次性查询（天气、新闻）、日常寒暄（心情不错）、纯知识问答（什么是HRBP）、已经存过的重复信息
判断标准：下次对话时，这条信息是否帮助芝士更好理解 Kim？是 → 记；否 → 不记。`,
    inputSchema: z.object({
      type: z.enum(['fact', 'preference', 'event', 'decision']).describe('记忆类型：fact=Kim分享的信息 | preference=Kim的偏好 | event=芝士做了什么 | decision=Kim的决策'),
      content: z.string().describe('记忆内容，一句中文摘要，如"Kim 2026年7月投了字节HRBP岗位"'),
      keywords: z.array(z.string()).describe('搜索关键词，如["字节","HRBP","投递"]，用于后续检索'),
    }),
    execute: async ({ type, content, keywords }) => {
      const memory = await prisma.petMemory.create({
        data: { type, content, keywords },
      });
      return { id: memory.id, type, content, saved: true };
    },
  }),

  searchMemories: tool({
    description: '搜索芝士的长期记忆库。当 Kim 提到过去聊过的话题，或你不知道某个信息是否已经存过时调用。',
    inputSchema: z.object({
      query: z.string().describe('搜索关键词'),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ query, limit = 5 }) => {
      const memories = await prisma.petMemory.findMany({
        where: {
          OR: [
            { keywords: { hasSome: [query] } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });
      return memories.map((m) => ({ id: m.id, type: m.type, content: m.content, version: m.version, createdAt: m.createdAt }));
    },
  }),
};

// ============================================================
// 路由处理
// ============================================================

export async function POST(req: Request) {
  try {
    // 本接口在 middleware 白名单里（桌宠无登录态），陌生人可裸调。
    // 配了 PET_TOKEN 就强制校验请求头，防止 DeepSeek 额度被刷。
    const petToken = process.env.PET_TOKEN;
    if (petToken && req.headers.get('x-pet-token') !== petToken) {
      return Response.json({ error: '未授权' }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: '无效的 messages 格式' }, { status: 400 });
    }

    // 注入实时上下文（传入最后一条用户消息用于记忆检索）
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
    const context = await buildContext(lastUserMsg?.content);

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: SYSTEM_PROMPT + '\n\n' + context,
      messages,
      tools: TOOLS,
      stopWhen: isStepCount(10), // 最多 10 轮工具调用
      onError: ({ error }) => console.error('[POST /api/chat] stream error:', error),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[POST /api/chat]', error);
    return Response.json({ error: '对话处理失败' }, { status: 500 });
  }
}
