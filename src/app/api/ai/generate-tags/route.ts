import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `你是专业的简历关键词分析师。分析项目内容，提取 3-5 个最能概括该项目的标签。

## 标签规则
- 每个标签 2-6 个字
- 覆盖：技术/方法论（如"微前端架构"）、业务领域（如"电商增长"）、核心能力（如"团队管理"）
- 只输出标签，用中文逗号分隔，不要任何解释
- 示例输出：微前端架构, 性能优化, 跨团队协作, React生态

现在分析以下项目内容，输出标签。`;

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: '缺少项目 ID' }, { status: 400 });
    }

    const project = await prisma.battleProject.findUnique({
      where: { id: projectId },
      include: { company: { select: { name: true, industry: true } } },
    });
    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    const parts: string[] = [];
    parts.push(`项目名称：${project.projectName}`);
    if (project.company?.name) parts.push(`公司：${project.company.name}（${project.company.industry || ''}）`);
    parts.push(`岗位：${project.role}`);
    if (project.origin) parts.push(`缘由：${stripHtml(project.origin).slice(0, 200)}`);
    if (project.goal) parts.push(`目标：${stripHtml(project.goal).slice(0, 200)}`);
    if (project.phase1 || project.phase2 || project.phase3) {
      const phases = [project.phase1, project.phase2, project.phase3]
        .filter(Boolean)
        .map((p) => stripHtml(p!).slice(0, 150))
        .join('；');
      parts.push(`过程：${phases}`);
    }
    if (project.results) parts.push(`成果：${stripHtml(project.results).slice(0, 200)}`);

    const content = parts.join('\n');

    const result = await generateText({
      model: deepseek('deepseek-chat'),
      system: SYSTEM_PROMPT,
      prompt: content,
      temperature: 0.3,
    });

    const raw = result.text.trim();
    const tags = raw
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 12)
      .slice(0, 5);

    if (tags.length === 0) {
      return NextResponse.json({ error: 'AI 未能生成有效标签' }, { status: 500 });
    }

    await prisma.battleProject.update({
      where: { id: projectId },
      data: { tags },
    });

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/ai/generate-tags]', error);
    return NextResponse.json({ error: '标签生成失败，请稍后重试' }, { status: 500 });
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}
