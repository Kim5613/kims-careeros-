// ────────────────────────────────────────────
// 内部战役模板解析 — 纯客户端 Markdown → 表单数据
// ────────────────────────────────────────────

export interface ParsedBattleTemplate {
  projectName?: string;
  companyName?: string;
  industry?: string;
  scale?: string;
  background?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  reportTo?: string;
  teamSize?: number;
  departments?: string;
  origin?: string;
  goal?: string;
  phase1?: string;
  phase2?: string;
  phase3?: string;
  results?: string;
  shortcomings?: string;
  skills: { skillName: string; category: string; level: number; targetLevel?: number; description?: string }[];
}

// ── 辅助：提取 ## 标题下的文本块 ──
// heading 按正则处理：调用方既传字面标题（'公司信息'），也传模式（'缘由.*' 吃掉括号后缀）
function extractSection(md: string, heading: string): string {
  const regex = new RegExp(
    `##\\s+(?:${heading})[^\\n]*\\n+([\\s\\S]*?)(?=\\n##\\s|$)`,
    'i'
  );
  const m = md.match(regex);
  return m ? m[1].trim() : '';
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── 辅助：提取列表项 ──
// 注意：`[：:]` 后不能用 `\s*`（\s 匹配换行，字段留空时会吞掉换行把下一行当值），
// 只允许行内空白，值不跨行
function extractListItem(md: string, label: string): string {
  const regex = new RegExp(`-\\s*${escapeRegex(label)}[：:][ \\t]*([^\\n]*)`, 'i');
  const m = md.match(regex);
  return m ? m[1].trim() : '';
}

// ── 辅助：提取 ### 子标题下的内容 ──
function extractSubSection(md: string, heading: string): string {
  const regex = new RegExp(
    `###\\s+(?:${heading})[^\\n]*\\n+([\\s\\S]*?)(?=\\n###\\s|\\n##\\s|$)`,
    'i'
  );
  const m = md.match(regex);
  return m ? m[1].trim() : '';
}

// ── 解析能力沉淀行 ──
function parseSkills(md: string): ParsedBattleTemplate['skills'] {
  const section = extractSection(md, '能力沉淀');
  if (!section) return [];

  const skills: ParsedBattleTemplate['skills'] = [];
  const lines = section.split('\n').filter((l) => l.trim().startsWith('-'));

  for (const line of lines) {
    // 格式：- 技能名 | 分类 | 等级 | 目标等级 | 描述
    const content = line.replace(/^-\s*/, '').trim();
    if (!content || content.includes('| |')) continue; // 跳过模板占位行

    const parts = content.split('|').map((p) => p.trim());
    if (parts.length < 3) continue;

    const skillName = parts[0];
    const category = parts[1] || 'hard';
    const level = parseInt(parts[2], 10) || 3;
    const targetLevel = parts[3] ? parseInt(parts[3], 10) || undefined : undefined;
    const description = parts[4] || undefined;

    if (skillName) {
      skills.push({ skillName, category, level, targetLevel, description });
    }
  }

  return skills;
}

/**
 * 解析用户填写的模板 Markdown，返回结构化数据。
 * 可直接用于 antd Form.setFieldsValue()。
 */
export function parseTemplateMarkdown(md: string): ParsedBattleTemplate {
  // ── 公司信息 ──
  const coSection = extractSection(md, '公司信息');
  const companyName = extractListItem(coSection, '公司名称');
  const industry = extractListItem(coSection, '行业');
  const scale = extractListItem(coSection, '规模');
  const background = extractListItem(coSection, '公司背景');

  // ── 项目内容 ──
  const projSection = extractSection(md, '项目内容');
  const role = extractListItem(projSection, '项目岗位');
  const startDate = extractListItem(projSection, '开始时间');
  const endDate = extractListItem(projSection, '结束时间');
  const duration = extractListItem(projSection, '周期');
  const reportTo = extractListItem(projSection, '向谁汇报');
  const teamSizeRaw = extractListItem(projSection, '团队规模');
  const teamSize = teamSizeRaw ? parseInt(teamSizeRaw, 10) || undefined : undefined;
  const departments = extractListItem(projSection, '涉及部门');

  // ── 项目名称 ──
  const nameMatch = md.match(/^#\s+(.+)/m);
  const projectName = nameMatch ? nameMatch[1].trim() : undefined;
  // 过滤掉模板占位符
  const cleanProjectName = projectName && projectName !== '项目名称' ? projectName : undefined;

  // ── 各文本区块 ──
  const origin = extractSection(md, '缘由.*');
  const goal = extractSection(md, '目标.*');
  const phase1 = extractSubSection(md, '1\\.?\\s*调研.*|调研.*规划.*');
  const phase2 = extractSubSection(md, '2\\.?\\s*执行.*');
  const phase3 = extractSubSection(md, '3\\.?\\s*收尾.*');
  const results = extractSection(md, '结果.*');
  const shortcomings = extractSection(md, '不足.*');

  // ── 能力沉淀 ──
  const skills = parseSkills(md);

  return {
    projectName: cleanProjectName,
    companyName: companyName || undefined,
    industry: industry || undefined,
    scale: scale || undefined,
    background: background || undefined,
    role: role || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    duration: duration || undefined,
    reportTo: reportTo || undefined,
    teamSize,
    departments: departments || undefined,
    origin: origin || undefined,
    goal: goal || undefined,
    phase1: phase1 || undefined,
    phase2: phase2 || undefined,
    phase3: phase3 || undefined,
    results: results || undefined,
    shortcomings: shortcomings || undefined,
    skills,
  };
}

// ── 模板内容 ──
export const BATTLE_TEMPLATE_MD = `# 项目名称

## 公司信息
- 公司名称：
- 行业：
- 规模：
- 公司背景：

## 项目内容
- 项目岗位：
- 开始时间：
- 结束时间：
- 周期：
- 向谁汇报：
- 团队规模：
- 涉及部门：

## 缘由（为什么要做这个项目）

## 目标（量化成功标准）

## 过程
### 1. 调研/规划阶段

### 2. 执行阶段

### 3. 收尾阶段

## 结果（量化成果）

## 不足与反思

## 能力沉淀
<!-- 每项格式：技能名 | 分类(hard/soft/domain/tool) | 当前等级(1-4) | 目标等级(1-4) | 一句话描述 -->
-  |  |  |  |
`;

/**
 * 触发模板 Markdown 文件下载
 */
export function downloadTemplate(): void {
  const blob = new Blob([BATTLE_TEMPLATE_MD], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '内部战役项目模板.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
