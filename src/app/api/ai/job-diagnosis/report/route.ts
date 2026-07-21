import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { searchWeb } from '@/lib/ai/search';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `你是一位资深猎头合伙人 + 企业战略顾问，15年经验。

你的任务：根据用户提供的公司名、JD、简历，生成一份完整的求职适配度诊断报告。

## 执行步骤

1. **联网调研**（用 searchWeb 工具）：
   - 搜索公司融资/工商/舆情/高管变动
   - 搜索行业趋势/政策风险
   - 搜索该岗位的市场薪酬水平
   - 深度版：额外搜索竞对 + 政策原文 + 关键 claim 交叉验证

2. **JD 拆解**：按四类分类：
   - [硬性-门槛]：技能/年限/学历/证书
   - [硬性-加分]：含"优先"或宽松量化
   - [软性-特质]：性格/风格/价值观
   - [软性-场景]：工作模式/环境要求

3. **人岗匹配**：五维评分（M1技能重合度 / M2年限匹配 / M3文化契合 / M4经历相关性 / M5成长潜力）

4. **真实招聘意图**：填坑/扩张/储备/背锅/探针·幽灵

## 输出格式（严格按此结构）

# 🔮 求职适配度诊断报告

## ⚖️ 一句话裁决
[一句话总结是否推荐，为什么]

## 🚦 灯色总览
| 维度 | 评分 | 灯色 |
|------|------|------|
| 岗位匹配 | xx/100 | 🟢/🟡/🟠/🔴 |
| 公司健康 | xx/100 | ... |
| 行业前景 | xx/100 | ... |
| 人岗匹配 | xx/100 | ... |
| **综合** | **xx/100** | **...** |

## 🎯 行动清单
- 🔴 劝退项：...
- 🟠 谨慎观望：...
- 🟡 必核实：...
- 🟢 加分项：...

---

## 📊 第一章 · 岗位分析

### JD 四分类
[拆解为四类清单，每类列出具体项和潜台词]

### 岗位生态位
[汇报对象/团队规模/离职原因推测]

**评分卡** | R1.1 需求真实度 | R1.2 JD 专业度 | R1.3 潜台词信号 | R1.4 成长空间 | R1.5 幽灵岗位风险

---

## 📊 第二章 · 公司诊断

[≤300 字叙事：融资阶段/营收健康度/管理稳定性/负面舆情]

**评分卡** | R2.1 融资与现金流 | R2.2 负面舆情 | R2.3 创始人/高管 | R2.4 员工口碑

---

## 📊 第三章 · 行业研判

[≤300 字叙事：赛道景气度/政策风险/AI 替代可能性]

**评分卡** | R3.1 赛道景气 | R3.2 政策风险 | R3.3 AI 替代风险

---

## 🎯 真实招聘意图
[填坑/扩张/储备/背锅/探针·幽灵 — 标 [推测] 并写推理链]

---

## 🤝 第四章 · 人岗匹配

### M1 技能重合度
### M2 年限匹配
### M3 文化契合
### M4 经历-意图契合度
### M5 成长潜力

---

## 🗣️ CEO 独白
[150-250 字，第一人称，CEO 视角谈这个岗位]

---

## 🔪 反向逼问 HR
1. ...
2. ...
3. ...

---

## 📎 附录
- 信源列表
- 置信度说明
- openQuestions

## 规则
- 不确定标 [待确认] 或 [推测]，不硬编
- 数据缺失标 ⚪，计入面试必核实清单
- R2.1 或 R2.2 出 🔴 → 一票否决，总分封顶 59
- 真诚坦率，该劝退就劝退`;

export async function POST(req: NextRequest) {
  try {
    const { company, jd, resume, focus, depth } = await req.json();

    if (!company || !jd || !resume) {
      return new Response(JSON.stringify({ error: '缺少必填信息：公司名、JD、简历' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 服务端直接搜索，绕过 AI SDK 工具调用问题
    let searchContext = '';
    try {
      const queries = [
        `${company} 公司 融资 财报`,
         `${company} 员工评价 工作体验`,
      ];
      const results = await Promise.all(queries.map(q => searchWeb(q, 3)));
      searchContext = results.map((res:any) => (res.results||[]).map((r:any) => `- ${r.title||''}: ${r.snippet||''}`).join('\n')).join('\n');
    } catch (_) { searchContext = '(联网搜索暂不可用)'; }

    let contextNote = '';
    try {
      const existing = await prisma.company.findFirst({ where: { name: { contains: company.slice(0, 4) } } });
      if (existing) { contextNote += `\n[数据库] ${existing.name}（${existing.industry || ''}，${existing.scale || ''}）`; }
    } catch (_) {}

    const fullPrompt = `## 目标公司
${company}

## 岗位 JD
${jd}

## 我的简历
${resume}

## 联网调研结果
${searchContext}
${contextNote}

## 深度档位
${depth === 'deep' ? '深度版' : '标准版'}

请基于以上调研结果，严格按照输出格式生成完整的求职适配度诊断报告。`;

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    let fullText = '';
    for await (const chunk of result.textStream) { fullText += chunk; }
    return new Response(JSON.stringify({ report: fullText }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('[job-diagnosis/report] Error:', error);
    return new Response(JSON.stringify({ error: '报告生成失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
