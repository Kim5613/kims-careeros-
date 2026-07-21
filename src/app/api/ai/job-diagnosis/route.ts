import { NextRequest } from 'next/server';
import { streamText, tool } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { searchWeb, fetchPage } from '@/lib/ai/search';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `你是一位资深猎头合伙人 + 企业战略顾问，15年经验，专门做求职适配度诊断。

你的任务：结合用户提供的信息（公司名、JD、简历），从岗位生态（微观）、公司基本面（中观）、行业趋势（宏观）三个维度进行分析，输出诊断报告。

## 核心能力
- 透过 JD 看本质，识别隐藏要求、团队文化信号、真实招聘意图
- 评估公司发展阶段、融资健康度、管理稳定性
- 判断行业趋势、政策风险、AI 替代可能性
- 人岗匹配度量化评分

## 输出格式
用 Markdown，结论先行（30秒可读完核心）：

⚖️ **一句话裁决**
🚦 **灯色总览**（🟢绿/🟡黄/🟠橙/🔴红/⚪灰）
🎯 **行动清单**（劝退项/谨慎观望/必核实/加分项）
📊 **三维分析**（岗位/公司/行业，每章 ≤300字叙事 + 评分卡）
🎯 **真实招聘意图**（填坑/扩张/储备/背锅/探针·幽灵）
🤝 **人岗匹配**（M1技能/M2年限/M3文化/M4经历/M5成长）
🗣️ **CEO独白**（150-250字第一人称）
🔪 **反向逼问HR 3问**

## 规则
- 不确定的标 [待确认] 或 [推测]，不要硬编
- 数据缺失标 ⚪，不强行打分
- 真诚坦率，该劝退就劝退
- 用 Emoji 灯色表达判断
- 如果用户提供的信息不足（缺公司名/JD/简历），先追问补充，不做分析

现在开始诊断。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 注入数据上下文：简历、投递记录
    let contextNote = '';
    try {
      const [resumes, apps] = await Promise.all([
        prisma.resume.findMany({ where: { isDefault: true }, take: 1 }),
        prisma.jobApplication.findMany({ where: { currentStage: { not: '已结束' } }, take: 5, orderBy: { updatedAt: 'desc' } }),
      ]);
      if (resumes.length > 0) {
        contextNote += `\n[系统上下文] 用户默认简历：${resumes[0].title}（${resumes[0].targetPosition || '未指定目标岗位'}）。内容摘要：${resumes[0].content.slice(0, 500)}`;
      }
      if (apps.length > 0) {
        contextNote += `\n[系统上下文] 用户当前活跃投递：${apps.map(a => `${a.positionName}@${a.companyId}(${a.currentStage})`).join('、')}`;
      }
    } catch (_) { /* 数据库不可用时跳过 */ }

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: SYSTEM_PROMPT + contextNote,
      messages: (messages || []),
      tools: {
        searchWeb: tool({
          description: '搜索互联网获取公司信息、行业数据、舆情',
          inputSchema: z.object({ query: z.string(), limit: z.number().optional().default(5) }),
          execute: async ({ query, limit }: any) => {
            const results = await searchWeb(query, limit || 5);
            return results;
          },
        }),
        fetchPage: tool({
          description: '抓取网页内容',
          inputSchema: z.object({ url: z.string() }),
          execute: async ({ url }: any) => {
            const content = await fetchPage(url);
            return content;
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[job-diagnosis] Error:', error);
    return new Response(JSON.stringify({ error: '诊断服务暂时不可用' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
