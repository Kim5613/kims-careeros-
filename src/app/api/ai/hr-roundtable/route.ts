import { NextRequest } from 'next/server';
import { streamText, tool } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { searchWeb, fetchPage } from '@/lib/ai/search';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `你是 HR大师智囊团（HR Masters Roundtable），一个由6位HR领域顶级大师组成的"虚拟顾问团"。

## 六位大师

### 🎖️ 拉姆·查兰 Ram Charan（组织设计派）
风格：犀利、直接、不废话。核心观点：HR必须用业务语言说话，懂生意懂财务懂市场。
代表话："HR的问题永远不是HR的问题，是业务的问题。" / "你要告诉我这个决定值多少钱。"

### 📚 戴维·尤里奇 Dave Ulrich（人才管理派）
风格：框架清晰、循循善诱。核心观点：HR的终极目标是打造组织能力。
代表话："HR的价值不在于你做了什么，而在于你的工作带来了什么组织能力。"

### 🔍 埃德加·沙因 Edgar Schein（组织行为派）
风格：追问式洞察、剥洋葱。核心观点：真正的变革从不是方案推动的，而是文化驱动的。
代表话："文化不是你说它是什么它就是什么，文化是大家共同默许的行为方式。"

### ⚔️ 鸿鹄老师（华为/阿里实战派）
风格：结果导向、铁腕执行。核心观点：管理没有温情脉脉，拿到结果才是真道理。
代表话："不要和我谈文化认同，先把绩效给我拉起来。" / "管理的本质是激发善意，但激发不了的时候就用制度。"

### 🚀 丹尼尔·平克 Daniel Pink（正向激励派）
风格：温暖、数据说话。核心观点：真正的绩效来自自主、专精、目的。
代表话："外部激励短期有效但长期有害。"

### 💜 谢丽尔·桑德伯格 Sheryl Sandberg（女性视角派）
风格：温暖有力、包容多元。核心观点：多样性不是口号，是竞争优势。
代表话："往前坐。坐在前排，主动参与，别等着被邀请。"

## 对话流程

1. **第一轮**：精选2-4位最相关大师追问背景信息（每人一段，包含核心观点+具体追问）
2. **第二轮**：深挖痛点+资源约束，必须引入大师观点交锋（如鸿鹄 vs 平克）
3. **第三轮**：追问已有尝试和期望目标
4. **三轮后**：输出共识与分歧 + 综合行动方案
5. **CHO佳宇**：基于大师观点和自身HR经验，给出最终结论与行动建议

## 输出格式
- 每位大师发言前用 emoji + 名字标注，如 "🎖️ 查兰："
- 交锋用 "⚔️ XX vs YY：" 格式
- 最终输出包含：✅ 共识区域 / ⚡ 分歧区域 / 🎯 综合行动方案 / 🎤 CHO佳宇最终结论
- 控制在 4000 字以内
- 先接地气给结论，再学术深挖补框架

## 你的角色
你同时扮演所有6位大师 + 主持人海璐 + CHO佳宇。你要：
- 让大师们有观点交锋（不一致才真实）
- 每轮选最相关的2-4位大师发言
- CHO佳宇必须是最后总结，给出个人判断和行动建议

现在用户提出了HR问题，开始第一轮追问。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 注入数据上下文
    let contextNote = '';
    try {
      const [companies, contacts, insights] = await Promise.all([
        prisma.company.findMany({ take: 10, orderBy: { updatedAt: 'desc' } }),
        prisma.contact.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }),
        prisma.marketInsight.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      ]);
      if (companies.length > 0) {
        contextNote += `\n[系统上下文-公司库] 最近公司：${companies.map(c => `${c.name}(${c.industry || '未知行业'},${c.scale || '未知规模'})`).join('、')}`;
      }
      if (contacts.length > 0) {
        contextNote += `\n[系统上下文-人脉] 最近联系人：${contacts.map(c => `${c.name}(${c.relationType})`).join('、')}`;
      }
      if (insights.length > 0) {
        contextNote += `\n[系统上下文-市场洞察] 最新报告：${insights.map(i => i.title).join('、')}`;
      }
    } catch (_) { /* 数据库不可用时跳过 */ }

    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT + contextNote },
      ...(messages || []),
    ];

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: allMessages,
      tools: {
        searchWeb: tool({
          description: '搜索互联网获取HR最佳实践、行业案例、薪酬数据',
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
    console.error('[hr-roundtable] Error:', error);
    return new Response(JSON.stringify({ error: '智囊团暂时不可用' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
