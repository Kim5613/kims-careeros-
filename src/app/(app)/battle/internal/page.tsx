'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Tag, Button, Input, Form, Select, DatePicker, Row, Col, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, BoldOutlined, HighlightOutlined, UnderlineOutlined, OrderedListOutlined, UnorderedListOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc); dayjs.extend(timezone);
const now = () => dayjs().tz('Asia/Shanghai');

const { Text } = Typography;
const { TextArea } = Input;

// ── 富文本编辑器 ──
const FONT_SIZES = ['12', '13', '14', '16', '18', '20'];
const TEXT_COLORS = ['#333', '#8b7cf0', '#fa8c16', '#e05858', '#4cb840', '#1890ff', '#888', '#bbb'];
const HIGHLIGHT_COLORS = ['#fff3b0', '#ffd6e7', '#d9f7be', '#e6d6ff', '#ffe7ba', '#bae7ff', '#f5f5f5', 'transparent'];

function exec(cmd: string, val?: string) {
  document.execCommand(cmd, false, val as any);
}

function RichEditor({ id, value, onChange }: { id: string; value?: string; onChange?: (html: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(false);
  const [showHL, setShowHL] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Sync value from Form.Item → contentEditable
  useEffect(() => {
    if (ref.current && value !== undefined && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) onChange?.(ref.current.innerHTML);
  };

  const focusEditor = () => ref.current?.focus();

  // Expand: copy content to overlay editor
  const openExpand = () => {
    setExpanded(true);
    setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.innerHTML = ref.current?.innerHTML || '';
        overlayRef.current.focus();
      }
    }, 50);
  };
  const closeExpand = () => {
    // Sync overlay content back to main editor
    if (overlayRef.current && ref.current) {
      ref.current.innerHTML = overlayRef.current.innerHTML;
      onChange?.(ref.current.innerHTML);
    }
    setExpanded(false);
  };

  const tb = (icon: React.ReactNode, title: string, action: () => void, active = false) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); focusEditor(); action(); }}
      style={{ border: 'none', background: active ? '#f0ece8' : 'transparent', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, color: active ? '#555' : '#999', fontSize: 14, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f0ece8'; e.currentTarget.style.color = '#555'; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? '#f0ece8' : 'transparent'; e.currentTarget.style.color = active ? '#555' : '#999'; }}
    >{icon}</button>
  );

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}
      onFocus={() => { if (ref.current?.parentElement) ref.current.parentElement.style.borderColor = '#8b7cf0'; }}
      onBlur={() => { if (ref.current?.parentElement) ref.current.parentElement.style.borderColor = '#d9d9d9'; }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 8px', background: '#fafafa', borderBottom: '1px solid #f0ece8', flexWrap: 'wrap' }}>
        {tb(<BoldOutlined />, '加粗', () => exec('bold'))}
        {tb(<UnderlineOutlined />, '下划线', () => exec('underline'))}

        <span style={{ width: 1, height: 18, background: '#e8e8e8', margin: '0 4px' }} />

        {tb(<OrderedListOutlined />, '有序列表', () => exec('insertOrderedList'))}
        {tb(<UnorderedListOutlined />, '无序列表', () => exec('insertUnorderedList'))}

        {/* Font size */}
        <div style={{ position: 'relative' }}>
          {tb(<Text style={{ fontSize: 12, fontWeight: 600 }}>A</Text>, '字号', () => setShowSize(!showSize))}
          {showSize && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '4px 0', minWidth: 60 }}
              onMouseLeave={() => setShowSize(false)}>
              {FONT_SIZES.map(sz => (
                <div key={sz} onMouseDown={e => { e.preventDefault(); exec('fontSize', sz); setShowSize(false); }}
                  style={{ padding: '4px 12px', cursor: 'pointer', fontSize: 13, color: '#555' }}
                  onMouseEnter={e2 => { e2.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={e2 => { e2.currentTarget.style.background = 'transparent'; }}
                >{sz}px</div>
              ))}
            </div>
          )}
        </div>

        <span style={{ width: 1, height: 18, background: '#e8e8e8', margin: '0 4px' }} />

        {/* Text color */}
        <div style={{ position: 'relative' }}>
          {tb(<span style={{ display: 'inline-block', width: 14, height: 14, border: '1px solid #d9d9d9', borderRadius: 3, background: '#333' }} />, '文字颜色', () => setShowColors(!showColors))}
          {showColors && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 6, display: 'flex', gap: 4 }}
              onMouseLeave={() => setShowColors(false)}>
              {TEXT_COLORS.map(c => (
                <span key={c} onMouseDown={e => { e.preventDefault(); exec('foreColor', c); setShowColors(false); }}
                  style={{ width: 20, height: 20, borderRadius: 4, background: c, cursor: 'pointer', border: c === '#fff' ? '1px solid #e8e8e8' : 'none' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight color */}
        <div style={{ position: 'relative' }}>
          {tb(<span style={{ display: 'inline-block', width: 14, height: 14, border: '1px solid #d9d9d9', borderRadius: 3, background: '#fff3b0' }} />, '高亮颜色', () => setShowHL(!showHL))}
          {showHL && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 6, display: 'flex', gap: 4 }}
              onMouseLeave={() => setShowHL(false)}>
              {HIGHLIGHT_COLORS.map(c => (
                <span key={c} onMouseDown={e => { e.preventDefault(); exec('hiliteColor', c === 'transparent' ? '#ffffff' : c); setShowHL(false); }}
                  style={{ width: 20, height: 20, borderRadius: 4, background: c, cursor: 'pointer', border: c === 'transparent' ? '2px dashed #d9d9d9' : '1px solid #e8e8e8' }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />
        {tb(<ExpandOutlined />, '全屏编辑', openExpand)}
      </div>

      {/* Editor area */}
      <div
        id={id}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ padding: '10px 12px', minHeight: 72, outline: 'none', fontSize: 14, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: 'text' }}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
      <style>{`
        #${id} ol, #${id} ul { padding-left: 1.2em; margin: 4px 0; }
        #${id} li { margin-bottom: 2px; }
      `}</style>

      {/* Full-screen expand overlay */}
      {expanded && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.3)' }}
          onClick={e => { if (e.target === e.currentTarget) closeExpand(); }}>
          <div style={{ margin: '24px 48px', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 16px', background: '#fafafa', borderBottom: '1px solid #f0ece8', flexShrink: 0 }}>
              <Text type="secondary" style={{ fontSize: 12, marginRight: 12 }}>全屏编辑</Text>
              {tb(<BoldOutlined />, '加粗', () => { overlayRef.current?.focus(); exec('bold'); })}
              {tb(<UnderlineOutlined />, '下划线', () => { overlayRef.current?.focus(); exec('underline'); })}
              <span style={{ width: 1, height: 18, background: '#e8e8e8', margin: '0 4px' }} />
              {tb(<OrderedListOutlined />, '有序列表', () => { overlayRef.current?.focus(); exec('insertOrderedList'); })}
              {tb(<UnorderedListOutlined />, '无序列表', () => { overlayRef.current?.focus(); exec('insertUnorderedList'); })}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={closeExpand}
                style={{ border: 'none', background: '#8b7cf0', color: '#fff', cursor: 'pointer', padding: '4px 14px', borderRadius: 6, fontSize: 13 }}>
                <CompressOutlined style={{ marginRight: 4 }} />收起
              </button>
            </div>
            <div
              ref={overlayRef}
              contentEditable
              suppressContentEditableWarning
              style={{ flex: 1, padding: '24px 32px', outline: 'none', fontSize: 15, lineHeight: 1.9, color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── 类型 ──
interface CompanyInfo { id: string; name: string; industry: string | null; scale: string | null; background: string | null; }
interface SkillEntry { skillId: string; skillName: string; category: string; level: number; description: string | null; targetLevel: number | null; }
interface BattleProject {
  id: string;
  companyId: string;
  company?: CompanyInfo;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  origin: string | null;
  goal: string | null;
  reportTo: string | null;
  teamSize: number | null;
  departments: string | null;
  duration: string | null;
  phase1: string | null;
  phase2: string | null;
  phase3: string | null;
  results: string | null;
  shortcomings: string | null;
  skills: SkillEntry[];
  createdAt: string;
  updatedAt: string;
}

const emptySkill = (): SkillEntry => ({ skillId: '', skillName: '', category: 'hard', level: 3, description: null, targetLevel: null });

// ── Mock ──
const MOCK: BattleProject[] = [
  {
    id: 'demo1', companyId: 'c1',
    company: { id: 'c1', name: '字节跳动', industry: '互联网/电商', scale: '10万人+', background: '抖音电商业务高速扩张期，前端架构分散在多个业务线，技术栈不统一导致跨线协作成本极高。我加入的核心原因是有机会从零主导架构统一。' },
    projectName: '微前端架构统一', role: '高级前端工程师', startDate: '2025-03-01', endDate: '2025-09-30',
    origin: '业务线扩张导致前端架构碎片化，3条业务线各自维护技术栈，跨线复用几乎为零，每次新业务启动都要重复造轮子',
    goal: '跨业务线组件复用率从15%提升到60%以上；首屏加载时间降低30%；新业务线启动人力减少50%',
    reportTo: '前端技术总监', teamSize: 8, departments: '前端架构组、电商业务线、直播业务线、本地生活线', duration: '7个月',
    phase1: '调研 qiankun / Module Federation / EMP 三个方案，输出对比报告（2周）。最终选型 qiankun，理由是生态成熟、侵入性低、团队学习成本可控',
    phase2: '核心决策：是否要统一技术栈到 React 18？最终决定分步走——先统一运行时再统一框架。最大困难是直播线的老代码迁移，通过灰度切流+双栈运行期解决（6周并行期）。执行期4个月',
    phase3: '交付物：微前端底座（npm包）、3条业务线迁移完成、编码规范文档、Code Review 流程。验收标准：全部通过性能基线和自动化回归测试。交接给架构组 ongoing 维护',
    results: '首屏加载从 2.8s 降到 1.1s（↓60%）；跨线组件复用率从 15% 升至 62%；新业务启动人力从 4 人周降到 2 人周',
    shortcomings: '双栈运行期的监控做得不够，前期有两次线上故障没及时发现。迁移文档应该更早开始写，而不是收尾时补',
    skills: [
      { skillId: 'ta9', skillName: '沟通影响力', category: 'soft', level: 4, description: '与 CTO 及各业务线负责人紧密协作，推动架构决策落地', targetLevel: 4 },
      { skillId: 'ta3', skillName: '系统架构', category: 'hard', level: 4, description: '独立完成微前端架构设计与技术选型，覆盖 3 条业务线', targetLevel: 4 },
    ],
    createdAt: '2025-09-30T10:00:00Z', updatedAt: '2025-09-30T10:00:00Z',
  },
];

function mapProject(raw: any): BattleProject {
  return {
    id: raw.id,
    companyId: raw.companyId || raw.company?.id || '',
    company: raw.company,
    projectName: raw.projectName || '',
    role: raw.role || '',
    startDate: raw.startDate || '',
    endDate: raw.endDate || null,
    origin: raw.origin || null,
    goal: raw.goal || null,
    reportTo: raw.reportTo || null,
    teamSize: raw.teamSize ?? null,
    departments: raw.departments || null,
    duration: raw.duration || null,
    phase1: raw.phase1 || null,
    phase2: raw.phase2 || null,
    phase3: raw.phase3 || null,
    results: raw.results || null,
    shortcomings: raw.shortcomings || null,
    skills: raw.skills || [],
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  };
}

const SKILL_CATEGORIES = [
  { value: 'hard', label: 'hard · 硬技能', color: '#8b7cf0' },
  { value: 'soft', label: 'soft · 软实力', color: '#fa8c16' },
  { value: 'domain', label: 'domain · 领域知识', color: '#52c41a' },
  { value: 'tool', label: 'tool · 工具', color: '#1890ff' },
];
const catColor = (c: string) => SKILL_CATEGORIES.find(x => x.value === c)?.color ?? '#8b7cf0';

export default function BattleInternalPage() {
  const [data, setData] = useState<BattleProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<'detail' | 'form' | null>(null);
  const [detail, setDetail] = useState<BattleProject | null>(null);
  const [editProj, setEditProj] = useState<BattleProject | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // 公司选择器
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [selectedCo, setSelectedCo] = useState<CompanyInfo | null>(null);

  // 技能沉淀列表
  const [editSkills, setEditSkills] = useState<SkillEntry[]>([]);

  // ── 加载 ──
  const loadData = useCallback(async () => {
    try {
      const [projRes, coRes] = await Promise.all([
        fetch('/api/battle-projects'),
        fetch('/api/companies'),
      ]);
      if (projRes.ok) { const json = await projRes.json(); setData(json.map(mapProject)); } else setData(MOCK);
      if (coRes.ok) { const json = await coRes.json(); setCompanies(json); }
    } catch { setData(MOCK); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── API ──
  const api = {
    create: async (payload: any) => {
      const res = await fetch('/api/battle-projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      setData(prev => [mapProject(created), ...prev]);
      // Refresh company list in case background was updated
      const coRes = await fetch('/api/companies');
      if (coRes.ok) setCompanies(await coRes.json());
      return created;
    },
    update: async (id: string, payload: any) => {
      const res = await fetch(`/api/battle-projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setData(prev => prev.map(p => p.id === id ? mapProject(updated) : p));
      const coRes = await fetch('/api/companies');
      if (coRes.ok) setCompanies(await coRes.json());
      return updated;
    },
    remove: async (id: string) => {
      await fetch(`/api/battle-projects/${id}`, { method: 'DELETE' });
      setData(prev => prev.filter(p => p.id !== id));
    },
  };

  // ── 公司选择 → 自动带出 ──
  const handleCompanySelect = (companyId: string) => {
    const co = companies.find(c => c.id === companyId);
    if (co) {
      setSelectedCo(co);
      form.setFieldsValue({
        company_industry: co.industry || '',
        company_scale: co.scale || '',
        company_background: co.background || '',
      });
    }
  };

  // ── 表单 ──
  const openForm = (proj?: BattleProject) => {
    setEditProj(proj || null);
    if (proj) {
      form.setFieldsValue({
        companyId: proj.companyId,
        projectName: proj.projectName, role: proj.role,
        startDate: proj.startDate ? dayjs(proj.startDate) : null,
        endDate: proj.endDate ? dayjs(proj.endDate) : null,
        origin: proj.origin, goal: proj.goal, reportTo: proj.reportTo,
        teamSize: proj.teamSize, departments: proj.departments, duration: proj.duration,
        phase1: proj.phase1, phase2: proj.phase2, phase3: proj.phase3,
        results: proj.results, shortcomings: proj.shortcomings,
        company_industry: proj.company?.industry || '',
        company_scale: proj.company?.scale || '',
        company_background: proj.company?.background || '',
      });
      setSelectedCo(proj.company || null);
      setEditSkills(proj.skills.length > 0 ? [...proj.skills] : []);
    } else {
      form.resetFields();
      setSelectedCo(null);
      setEditSkills([]);
    }
    setPanel('form');
  };

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);
      const payload: any = {
        companyId: v.companyId,
        projectName: v.projectName, role: v.role,
        startDate: v.startDate ? v.startDate.format('YYYY-MM-DD') : '',
        endDate: v.endDate ? v.endDate.format('YYYY-MM-DD') : null,
        origin: v.origin || null, goal: v.goal || null, reportTo: v.reportTo || null,
        teamSize: v.teamSize ?? null, departments: v.departments || null, duration: v.duration || null,
        phase1: v.phase1 || null, phase2: v.phase2 || null, phase3: v.phase3 || null,
        results: v.results || null, shortcomings: v.shortcomings || null,
        company_industry: v.company_industry || null,
        company_scale: v.company_scale || null,
        company_background: v.company_background || null,
        skills: editSkills.filter(s => s.skillName.trim()),
      };
      if (editProj) {
        await api.update(editProj.id, payload);
        message.success('已更新');
      } else {
        await api.create(payload);
        message.success('已创建');
      }
      setPanel(null); setEditProj(null);
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error('保存失败: ' + (e.message || ''));
    } finally { setSaving(false); }
  };

  const handleDelete = async (proj: BattleProject) => {
    await api.remove(proj.id);
    message.success('已删除');
    setPanel(null); setDetail(null);
  };

  // ── 技能编辑 ──
  const updateSkill = (i: number, field: string, value: any) => {
    setEditSkills(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));
  };
  const addSkill = () => setEditSkills(prev => [...prev, emptySkill()]);
  const removeSkill = (i: number) => setEditSkills(prev => prev.filter((_, j) => j !== i));

  // ── 卡片 ──
  const renderCard = (proj: BattleProject) => {
    const dateStr = proj.endDate ? `${proj.startDate} — ${proj.endDate}` : `${proj.startDate} — 进行中`;
    const coName = proj.company?.name || '';
    const defShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';

    return (
      <div key={proj.id} onClick={() => { setDetail(proj); setPanel('detail'); }}
        style={{ cursor: 'pointer', padding: '18px 20px', borderRadius: 14, background: '#fff', boxShadow: defShadow, transition: 'box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = defShadow; }}
      >
        <Text strong style={{ fontSize: 15, color: '#333' }}>{proj.projectName}</Text>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 13, color: '#888' }}>{coName}</Text>
          <Text style={{ fontSize: 12, color: '#bbb' }}>· {proj.role}</Text>
        </div>
        <Text style={{ fontSize: 12, color: '#bbb' }}>{dateStr}</Text>
        {proj.goal && (
          <Text style={{ fontSize: 11, color: '#bbb', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {proj.goal}
          </Text>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {proj.teamSize && <Text style={{ fontSize: 11, color: '#bbb' }}>👥 {proj.teamSize}人</Text>}
            {proj.skills.length > 0 && <Text style={{ fontSize: 11, color: '#bbb' }}>🏷️ {proj.skills.length}项能力</Text>}
            {proj.results && <Text style={{ fontSize: 11, color: '#4cb840' }}>✓ 有成果</Text>}
          </div>
          {!proj.phase1 && !proj.results && <Tag style={{ borderRadius: 8, margin: 0, fontSize: 11, color: '#ccc', background: '#fafafa', border: 'none' }}>待完善</Tag>}
        </div>
      </div>
    );
  };

  // ── 详情面板 ──
  const renderPanel = () => {
    if (panel === 'form') return renderForm();
    if (!detail) return null;
    const proj = detail;
    const dateStr = proj.endDate ? `${proj.startDate} — ${proj.endDate}` : `${proj.startDate} — 至今`;
    const co = proj.company;

    return (
      <div style={{ padding: '32px 36px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <Text strong style={{ fontSize: 20, display: 'block', lineHeight: 1.3 }}>{proj.projectName}</Text>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontSize: 15, color: '#555', fontWeight: 500 }}>{co?.name}</Text>
              <Text style={{ fontSize: 14, color: '#888' }}>· {proj.role}</Text>
            </div>
          </div>
          <span onClick={() => { setPanel(null); setDetail(null); }} style={{ fontSize: 22, color: '#bbb', cursor: 'pointer', lineHeight: 1 }}>×</span>
        </div>

        {/* 关键信息条 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          <InfoTag label={dateStr} />
          {co?.industry && <InfoTag label={co.industry} />}
          {co?.scale && <InfoTag label={co.scale} />}
          {proj.duration && <InfoTag label={proj.duration} color="#8b7cf0" />}
          {proj.teamSize && <InfoTag label={`${proj.teamSize}人团队`} icon="👥" />}
          {proj.reportTo && <InfoTag label={`汇报: ${proj.reportTo}`} />}
        </div>

        {/* 公司背景 */}
        {co?.background && (
          <div style={{ marginBottom: 28 }}>
            <div style={secHead}>🏢 公司背景</div>
            <div style={textBlock} dangerouslySetInnerHTML={{ __html: co.background || '' }} />
          </div>
        )}

        {/* 缘由 & 目标 */}
        {proj.origin && (
          <div style={{ marginBottom: 24 }}>
            <div style={secHead}>📌 缘由</div>
            <div style={textBlock} dangerouslySetInnerHTML={{ __html: proj.origin || '' }} />
          </div>
        )}

        {proj.goal && (
          <div style={{ marginBottom: 28 }}>
            <div style={secHead}>🎯 目标</div>
            <div style={{ ...textBlock, background: '#f6ffed', border: '1px solid #d9f7be', color: '#135200' }} dangerouslySetInnerHTML={{ __html: proj.goal || '' }} />
          </div>
        )}

        {/* 角色与团队 */}
        {(proj.reportTo || proj.teamSize || proj.departments || proj.duration) && (
          <div style={{ marginBottom: 24 }}>
            <div style={secHead}>👥 角色与团队</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {proj.reportTo && <MetaRow label="汇报对象" value={proj.reportTo} />}
              {proj.teamSize && <MetaRow label="团队规模" value={`${proj.teamSize} 人`} />}
              {proj.departments && <MetaRow label="涉及部门" value={proj.departments} />}
              {proj.duration && <MetaRow label="项目周期" value={proj.duration} />}
            </div>
          </div>
        )}

        {/* 过程三段 */}
        {(proj.phase1 || proj.phase2 || proj.phase3) && (
          <div style={{ marginBottom: 28 }}>
            <div style={secHead}>📝 过程</div>
            <div style={{ background: '#fafafa', borderRadius: 12, padding: '18px 20px' }}>
              {proj.phase1 && (
                <div style={{ marginBottom: proj.phase2 || proj.phase3 ? 16 : 0 }}>
                  <PhaseLabel label="调研/规划" color="#8b7cf0" />
                  <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: proj.phase1 || '' }} />
                </div>
              )}
              {proj.phase2 && (
                <div style={{ marginBottom: proj.phase3 ? 16 : 0 }}>
                  <PhaseLabel label="执行" color="#fa8c16" />
                  <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: proj.phase2 || '' }} />
                </div>
              )}
              {proj.phase3 && (
                <div>
                  <PhaseLabel label="收尾" color="#1890ff" />
                  <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: proj.phase3 || '' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 结果 */}
        {proj.results && (
          <div style={{ marginBottom: 28 }}>
            <div style={secHead}>🎯 结果</div>
            <div style={{ ...textBlock, background: '#f6ffed', border: '1px solid #b7eb8f', fontSize: 15, color: '#135200', lineHeight: 1.9 }} dangerouslySetInnerHTML={{ __html: proj.results || '' }} />
          </div>
        )}

        {/* 不足 */}
        {proj.shortcomings && (
          <div style={{ marginBottom: 28 }}>
            <div style={secHead}>💡 不足与反思</div>
            <div style={{ ...textBlock, background: '#fffbe6', border: '1px solid #ffe58f', color: '#7c5e00' }} dangerouslySetInnerHTML={{ __html: proj.shortcomings || '' }} />
          </div>
        )}

        {/* 能力沉淀 */}
        {proj.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={secHead}>🏷️ 能力沉淀</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proj.skills.map((s, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: '#fafafa', border: '1px solid #f0ece8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: s.description ? 6 : 0 }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      color: catColor(s.category), background: catColor(s.category) + '16',
                    }}>{s.category}</span>
                    <Text strong style={{ fontSize: 14, flex: 1 }}>{s.skillName}</Text>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <Text style={{ color: '#8b7cf0', fontWeight: 600 }}>L{s.level}</Text>
                      {s.targetLevel && <><Text style={{ color: '#ccc' }}>→</Text><Text style={{ color: '#bbb' }}>L{s.targetLevel}</Text></>}
                    </span>
                  </div>
                  {s.description && <Text style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{s.description}</Text>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0ece8', paddingTop: 16 }}>
          <Button size="small" onClick={() => openForm(proj)} style={{ borderRadius: 8 }}>编辑</Button>
          <Popconfirm title="确认删除此项目？" onConfirm={() => handleDelete(proj)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
            <Button size="small" danger style={{ borderRadius: 8 }}>删除</Button>
          </Popconfirm>
        </div>
      </div>
    );
  };

  // ── 表单样式常量 ──
  const fi = (mb = 20) => ({ marginBottom: mb } as const);
  const inp = { borderRadius: 8, height: 40 } as const;
  const area = (rows = 3) => ({ borderRadius: 8, padding: '10px 12px' }) as const;

  // ── 表单 ──
  const renderForm = () => (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <Text strong style={{ fontSize: 18 }}>{editProj ? '编辑项目' : '新建项目'}</Text>
        <span onClick={() => { setPanel(null); setEditProj(null); }} style={{ fontSize: 22, color: '#bbb', cursor: 'pointer', lineHeight: 1 }}>×</span>
      </div>

      <Form form={form} layout="vertical" size="middle">

        {/* ═══ 公司信息 ═══ */}
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14 }}>🏢 公司信息</Text>

        <Form.Item name="companyId" label="公司" rules={[{ required: true, message: '请选择公司' }]} style={fi()}>
          <Select
            showSearch
            placeholder="搜索并选择公司…"
            filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
            options={companies.map(c => ({ label: c.name, value: c.id }))}
            onChange={handleCompanySelect}
            style={inp}
            dropdownRender={(menu) => (
              <div>{menu}<div style={{ padding: '8px 12px', borderTop: '1px solid #f0ece8' }}><Text type="secondary" style={{ fontSize: 11 }}>找不到？先在「公司库」中添加</Text></div></div>
            )}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="company_industry" label="行业" style={fi()}>
              <Input placeholder="如：互联网/电商" style={inp} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="company_scale" label="规模" style={fi()}>
              <Input placeholder="如：10万人+" style={inp} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="company_background" label="公司背景" style={fi(28)} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_company_bg" />
        </Form.Item>

        {/* ═══ 项目内容 ═══ */}
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14, marginTop: 4 }}>⚔️ 项目内容</Text>

        <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: '必填' }]} style={fi()}>
          <Input placeholder="如：微前端架构统一" style={inp} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="role" label="项目岗位" rules={[{ required: true, message: '必填' }]} style={fi()}>
              <Input placeholder="如：高级前端工程师" style={inp} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="duration" label="周期" style={fi()}>
              <Input placeholder="如：7个月" style={inp} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="startDate" label="开始" rules={[{ required: true, message: '必填' }]} style={fi()}>
              <DatePicker style={{ width: '100%', borderRadius: 8, height: 40 }} picker="month" placeholder="选择月份" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="endDate" label="结束" style={fi()}>
              <DatePicker style={{ width: '100%', borderRadius: 8, height: 40 }} picker="month" placeholder="至今可不选" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="reportTo" label="向谁汇报" style={fi()}>
              <Input placeholder="如：技术总监" style={inp} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="teamSize" label="团队规模" style={fi()}>
              <InputNumber min={1} placeholder="人数" style={{ width: '100%', borderRadius: 8, height: 40 }} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="departments" label="涉及部门" style={fi()}>
              <Input placeholder="如：前端架构组、电商业务线、直播业务线…" style={inp} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="origin" label="📌 缘由" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_origin" />
        </Form.Item>

        <Form.Item name="goal" label="🎯 目标" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_goal" />
        </Form.Item>

        <Form.Item name="phase1" label="📝 过程 · 1. 调研/规划阶段" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_phase1" />
        </Form.Item>

        <Form.Item name="phase2" label="2. 执行阶段" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_phase2" />
        </Form.Item>

        <Form.Item name="phase3" label="3. 收尾阶段" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_phase3" />
        </Form.Item>

        <Form.Item name="results" label="🎯 结果" style={fi()} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_results" />
        </Form.Item>

        <Form.Item name="shortcomings" label="💡 不足与反思" style={fi(28)} getValueFromEvent={(html: string) => html}>
          <RichEditor id="f_shortcomings" />
        </Form.Item>

        {/* ═══ 能力沉淀 ═══ */}
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14, marginTop: 4 }}>🏷️ 能力沉淀</Text>

        {editSkills.length === 0 && (
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 14, color: '#bbb' }}>此项目锻炼了哪些能力？</Text>
        )}

        {editSkills.map((s, i) => (
          <div key={i} style={{ marginBottom: 12, padding: '14px 16px', borderRadius: 10, background: '#fafafa', border: '1px solid #f0ece8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: '#bbb' }}>技能 #{i + 1}</Text>
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeSkill(i)} />
            </div>
            <Input
              value={s.skillName}
              onChange={e => updateSkill(i, 'skillName', e.target.value)}
              placeholder="技能名称"
              style={{ borderRadius: 8, height: 40, marginBottom: 10 }}
            />
            <Row gutter={12} style={{ marginBottom: 10 }}>
              <Col span={8}>
                <Select
                  value={s.category}
                  onChange={v => updateSkill(i, 'category', v)}
                  style={{ width: '100%', borderRadius: 8 }}
                  options={SKILL_CATEGORIES.map(x => ({ label: x.label, value: x.value }))}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  value={s.level}
                  onChange={v => updateSkill(i, 'level', v ?? 3)}
                  min={1} max={4}
                  addonBefore="当前 L"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  value={s.targetLevel}
                  onChange={v => updateSkill(i, 'targetLevel', v)}
                  min={1} max={4}
                  addonBefore="目标 L"
                  placeholder="目标"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Col>
            </Row>
            <Input
              value={s.description || ''}
              onChange={e => updateSkill(i, 'description', e.target.value)}
              placeholder="一句话描述你能做什么…"
              style={{ borderRadius: 8, height: 40 }}
            />
          </div>
        ))}

        <Button type="dashed" icon={<PlusOutlined />} onClick={addSkill} block style={{ borderRadius: 8, height: 40, marginBottom: 20 }}>
          添加技能
        </Button>
      </Form>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f0ece8' }}>
        <Button onClick={() => { setPanel(null); setEditProj(null); }} size="large" style={{ borderRadius: 8 }}>取消</Button>
        <Button type="primary" onClick={handleSave} loading={saving} size="large" style={{ borderRadius: 8, minWidth: 120 }}>
          {editProj ? '保存修改' : '创建项目'}
        </Button>
      </div>
    </div>
  );

  // ── 主页面 ──
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f6', position: 'relative' }}>
      <div style={{ flex: 1, padding: '40px 48px 24px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, color: '#1a1a1a', letterSpacing: '-0.02em' }}>内部战役</h1>
            <Text style={{ fontSize: 13, color: '#bbb', marginTop: 4, display: 'block' }}>
              项目经历是简历最强的素材源 · 共 {data.length} 个项目
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 14, color: '#bbb' }}>{now().format('M月D日 dddd')}</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()} style={{ borderRadius: 8 }}>新建项目</Button>
          </div>
        </div>

        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 14, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>⚔️</span>
            <Text style={{ fontSize: 15, color: '#bbb', display: 'block', marginBottom: 8 }}>记录你的内部战役</Text>
            <Text style={{ fontSize: 13, color: '#ddd', display: 'block', marginBottom: 20 }}>项目经历是简历最强的素材源</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()} style={{ borderRadius: 8 }}>创建第一个项目</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {data.map(p => renderCard(p))}
          </div>
        )}
      </div>

      {panel && (<>
        <div onClick={() => { setPanel(null); setDetail(null); setEditProj(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 50 }} />
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(1100px, 98vw)', maxHeight: '95vh', background: '#fff', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.15)', overflow: 'auto', zIndex: 51, animation: 'modalIn 0.2s ease' }}>
          {renderPanel()}
        </div>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
      </>)}
    </div>
  );
}

// ── 详情面板样式 ──
const secHead: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#333',
  borderLeft: '3px solid #8b7cf0', paddingLeft: 10, marginBottom: 10,
  lineHeight: 1.3,
};
const textBlock: React.CSSProperties = {
  padding: '14px 18px', borderRadius: 10, fontSize: 14,
  lineHeight: 1.8, whiteSpace: 'pre-wrap',
  background: '#fafafa', color: '#444',
};

function InfoTag({ label, color, icon }: { label: string; color?: string; icon?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 8, fontSize: 12,
      color: color || '#666', background: (color || '#888') + '12',
      border: '1px solid ' + (color || '#e8e8e8') + '30',
    }}>{icon ? icon + ' ' : ''}{label}</span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text style={{ fontSize: 12, color: '#999', display: 'block' }}>{label}</Text>
      <Text strong style={{ fontSize: 14, color: '#333' }}>{value}</Text>
    </div>
  );
}

function phaseTag(label: string, color: string): React.CSSProperties {
  return {
    fontSize: 13, fontWeight: 600, color, marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
    // We need to render actual text, so return style for the container
  };
}
// Actually phaseTag needs to return JSX, not style. Let me inline it above.

// Fix phaseTag to be a component
function PhaseLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color }} />
      <Text strong style={{ fontSize: 13, color }}>{label}</Text>
    </div>
  );
}
