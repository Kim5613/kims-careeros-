// ────────────────────────────────────────────
// 简历导出工具 — 纯客户端 HTML / Markdown 生成
// ────────────────────────────────────────────

// ── 导出数据类型 ──
export interface ExportPersonalInfo {
  name: string;
  phone: string;
  email: string;
  school: string;
  major: string;
}

export interface ExportWorkExperience {
  companyName: string;
  baseLocation?: string | null;
  position: string;
  startDate: string;
  endDate: string;
  coreWork: string; // 换行分隔的编号要点
}

export interface ExportProjectExperience {
  projectName: string;
  companyName: string;
  position?: string | null;
  startDate: string;
  endDate: string;
  process: string; // 换行分隔的编号要点
  results: string; // 换行分隔的编号要点
}

export interface ExportResumeData {
  personalInfo: ExportPersonalInfo;
  resume: {
    title?: string;
    targetPosition?: string | null;
    targetCompany?: string | null;
    version: number;
    /** 旧版简历备注（Markdown 纯文本），非空时作为「补充说明」追加到末尾 */
    content?: string;
  };
  workExperiences: ExportWorkExperience[];
  projectExperiences: ExportProjectExperience[];
}

// ── 辅助：将换行文本转为 <ol> HTML ──
function renderBulletPoints(text: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return '';
  const items = lines
    .map((l) => {
      // 去掉已有的编号前缀（如 "1. "、"1、"、(1) 等）
      const cleaned = l.replace(/^\d+[.、．)\s]+/, '').trim();
      return `<li>${escapeHTML(cleaned)}</li>`;
    })
    .join('');
  return `<ol>${items}</ol>`;
}

// ── 辅助：HTML 转义 ──
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── 辅助：格式化日期区间（如 2022-03 → 2022年3月）──
function formatDate(d: string): string {
  if (!d) return '';
  if (d === '至今' || d === 'present') return '至今';
  // 支持 YYYY-MM 或 YYYY.MM 或 YYYY年M月 等格式
  const match = d.match(/(\d{4})[年.\-/]?\s*(\d{1,2})?/);
  if (match) {
    const year = match[1];
    const month = match[2] ? String(parseInt(match[2], 10)) : undefined;
    return month ? `${year}年${month}月` : `${year}年`;
  }
  return d;
}

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// ════════════════════════════════════════════
// generateExportHTML
// ════════════════════════════════════════════

export function generateExportHTML(data: ExportResumeData): string {
  const { personalInfo: p, resume: r, workExperiences, projectExperiences } = data;

  const lines: string[] = [];

  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="zh-CN">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push(`<title>个人简历 - ${escapeHTML(p.name)} - V${r.version}</title>`);
  lines.push('<style>');
  lines.push(`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 15px; line-height: 1.8; color: #222;
      max-width: 800px; margin: 0 auto; padding: 40px 48px;
      background: #fff;
    }
    /* ── 个人信息（居中）── */
    .personal-info { text-align: center; margin-bottom: 24px; }
    .personal-info .name { font-size: 26px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .personal-info .contact { font-size: 14px; color: #555; margin-bottom: 4px; }
    .personal-info .edu { font-size: 14px; color: #555; }
    .personal-info .target { font-size: 14px; color: #333; font-weight: 600; margin-top: 6px; }

    /* ── 分隔线 ── */
    hr.section-divider {
      border: none; border-top: 2px solid #333; margin: 24px 0;
    }

    /* ── 区块标题 ── */
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #111; }

    /* ── 经历条目（条目之间用明显实线分隔）── */
    .exp-item { margin-bottom: 20px; }
    .exp-item + .exp-item { border-top: 1px solid #999; padding-top: 20px; }
    .exp-header { margin-bottom: 8px; }
    .exp-header .company { font-size: 16px; font-weight: 600; }
    .exp-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    .exp-meta .role { font-size: 14px; color: #444; }
    .exp-meta .period { font-size: 13px; color: #777; white-space: nowrap; }

    /* ── 项目条目 ── */
    .proj-item { margin-bottom: 20px; }
    .proj-item + .proj-item { border-top: 1px solid #999; padding-top: 20px; }
    .proj-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .proj-header .proj-name { font-size: 16px; font-weight: 600; }
    .proj-header .proj-company { font-size: 13px; color: #777; white-space: nowrap; }
    .proj-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    .proj-meta .proj-role { font-size: 14px; color: #444; }
    .proj-meta .proj-period { font-size: 13px; color: #777; white-space: nowrap; }

    /* ── 编号列表 ── */
    ol { padding-left: 24px; margin-bottom: 8px; }
    ol li { margin-bottom: 2px; }

    .sub-label { font-size: 13px; font-weight: 600; color: #555; margin-top: 8px; margin-bottom: 4px; }

    /* ── 补充说明（旧版备注）── */
    .notes { white-space: pre-wrap; font-size: 14px; color: #333; line-height: 1.8; }

    /* ── 打印样式 ── */
    @media print {
      body { padding: 20px 32px; }
      hr.section-divider { border-color: #000; }
      .exp-item + .exp-item, .proj-item + .proj-item { border-color: #666; }
    }
  `);
  lines.push('</style>');
  lines.push('</head>');
  lines.push('<body>');

  // ── 个人信息 ──
  lines.push('<div class="personal-info">');
  lines.push(`  <div class="name">${escapeHTML(p.name)}</div>`);
  lines.push(`  <div class="contact">${escapeHTML(p.phone)}　${escapeHTML(p.email)}</div>`);
  lines.push(`  <div class="edu">${escapeHTML(p.school)}　${escapeHTML(p.major)}</div>`);
  if (r.targetPosition || r.targetCompany) {
    const target = [r.targetPosition, r.targetCompany].filter(Boolean).join(' @ ');
    lines.push(`  <div class="target">求职意向：${escapeHTML(target)}</div>`);
  }
  lines.push('</div>');

  lines.push('<hr class="section-divider">');

  // ── 工作经历 ──
  lines.push('<div class="section-title">工作经历</div>');
  if (workExperiences.length === 0) {
    lines.push('<p style="color:#999; font-size:14px;">暂无工作经历</p>');
  } else {
    for (const we of workExperiences) {
      lines.push('<div class="exp-item">');
      lines.push(`  <div class="exp-header"><span class="company">${escapeHTML(we.companyName)}</span></div>`);
      lines.push('  <div class="exp-meta">');
      lines.push(`    <span class="role">${escapeHTML(we.position)}</span>`);
      lines.push(`    <span class="period">${formatDateRange(we.startDate, we.endDate)}</span>`);
      lines.push('  </div>');
      lines.push(renderBulletPoints(we.coreWork));
      lines.push('</div>');
    }
  }

  lines.push('<hr class="section-divider">');

  // ── 项目经历 ──
  lines.push('<div class="section-title">项目纪要</div>');
  if (projectExperiences.length === 0) {
    lines.push('<p style="color:#999; font-size:14px;">暂无项目经历</p>');
  } else {
    for (const pe of projectExperiences) {
      lines.push('<div class="proj-item">');
      lines.push('  <div class="proj-header">');
      lines.push(`    <span class="proj-name">${escapeHTML(pe.projectName)}</span>`);
      lines.push(`    <span class="proj-company">${escapeHTML(pe.companyName)}</span>`);
      lines.push('  </div>');
      lines.push('  <div class="proj-meta">');
      lines.push(`    <span class="proj-role">${escapeHTML(pe.position || '')}</span>`);
      lines.push(`    <span class="proj-period">${formatDateRange(pe.startDate, pe.endDate)}</span>`);
      lines.push('  </div>');
      if (pe.process.trim()) {
        lines.push('  <div class="sub-label">项目过程</div>');
        lines.push(renderBulletPoints(pe.process));
      }
      if (pe.results.trim()) {
        lines.push('  <div class="sub-label">项目成果</div>');
        lines.push(renderBulletPoints(pe.results));
      }
      lines.push('</div>');
    }
  }

  // ── 补充说明（旧版备注，非空才输出）──
  if (r.content && r.content.trim()) {
    lines.push('<hr class="section-divider">');
    lines.push('<div class="section-title">补充说明</div>');
    lines.push(`<div class="notes">${escapeHTML(r.content.trim())}</div>`);
  }

  lines.push('</body>');
  lines.push('</html>');

  return lines.join('\n');
}

// ════════════════════════════════════════════
// generateExportMD
// ════════════════════════════════════════════

export function generateExportMD(data: ExportResumeData): string {
  const { personalInfo: p, resume: r, workExperiences, projectExperiences } = data;

  const lines: string[] = [];

  // ── 个人信息（MD 中用 HTML 实现居中）──
  lines.push(`<div align="center">`);
  lines.push('');
  lines.push(`**${p.name}**`);
  lines.push('');
  lines.push(`${p.phone}　${p.email}`);
  lines.push('');
  lines.push(`${p.school}　${p.major}`);
  lines.push('');
  if (r.targetPosition || r.targetCompany) {
    const target = [r.targetPosition, r.targetCompany].filter(Boolean).join(' @ ');
    lines.push(`**求职意向：${target}**`);
    lines.push('');
  }
  lines.push(`</div>`);
  lines.push('');

  lines.push('---');
  lines.push('');

  // ── 工作经历 ──
  lines.push('## 工作经历');
  lines.push('');
  if (workExperiences.length === 0) {
    lines.push('_暂无工作经历_');
    lines.push('');
    lines.push('---');
    lines.push('');
  } else {
    for (const we of workExperiences) {
      lines.push(`### ${we.companyName}`);
      lines.push('');
      lines.push(`**${we.position}**　　_${formatDateRange(we.startDate, we.endDate)}_`);
      lines.push('');
      const workBullets = we.coreWork
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      for (const b of workBullets) {
        const cleaned = b.replace(/^\d+[.、．)\s]+/, '').trim();
        lines.push(`- ${cleaned}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // ── 项目经历 ──
  lines.push('## 项目纪要');
  lines.push('');
  if (projectExperiences.length === 0) {
    lines.push('_暂无项目经历_');
    lines.push('');
    lines.push('---');
    lines.push('');
  } else {
    for (const pe of projectExperiences) {
      // 项目名称 | 公司名称 同行
      lines.push(`### ${pe.projectName}　　_${pe.companyName}_`);
      lines.push('');
      const role = pe.position || '';
      const period = formatDateRange(pe.startDate, pe.endDate);
      lines.push(`**${role}**　　_${period}_`);
      lines.push('');

      if (pe.process.trim()) {
        lines.push('**项目过程**');
        lines.push('');
        const procBullets = pe.process
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        for (const b of procBullets) {
          const cleaned = b.replace(/^\d+[.、．)\s]+/, '').trim();
          lines.push(`- ${cleaned}`);
        }
        lines.push('');
      }

      if (pe.results.trim()) {
        lines.push('**项目成果**');
        lines.push('');
        const resBullets = pe.results
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        for (const b of resBullets) {
          const cleaned = b.replace(/^\d+[.、．)\s]+/, '').trim();
          lines.push(`- ${cleaned}`);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  // ── 补充说明（旧版备注，非空才输出）──
  if (r.content && r.content.trim()) {
    lines.push('## 补充说明');
    lines.push('');
    lines.push(r.content.trim());
    lines.push('');
  }

  return lines.join('\n');
}

// ════════════════════════════════════════════
// exportAsHTML — 在新窗口打开 HTML 简历
// ════════════════════════════════════════════

export function exportAsHTML(data: ExportResumeData): void {
  const html = generateExportHTML(data);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

// ════════════════════════════════════════════
// exportAsMD — 下载 Markdown 简历文件
// ════════════════════════════════════════════

export function exportAsMD(data: ExportResumeData): void {
  const md = generateExportMD(data);
  const filename = `简历-${data.personalInfo.name}-V${data.resume.version}.md`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
