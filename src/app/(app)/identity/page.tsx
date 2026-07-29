'use client';

import React, { useState, useMemo } from 'react';
import {
  Card, Button, Modal, Form, Input, Select, Tag, Typography,
  Space, message, Empty, Badge, Tooltip, Popconfirm, Row, Col, Divider,
  Spin, Radio,
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, StarOutlined, StarFilled, CopyOutlined, UploadOutlined,
  ExportOutlined, IdcardOutlined, UserOutlined,
  PhoneOutlined, MailOutlined, HomeOutlined, BookOutlined,
  EnvironmentOutlined, CalendarOutlined, OrderedListOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';
import { useApiList } from '@/lib/hooks/useApi';
import { useApiSingle } from '@/lib/hooks/useApiSingle';
import { exportAsHTML, exportAsMD, generateExportHTML, type ExportResumeData } from '@/lib/export-resume';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Types ──
interface ResumeItem {
  id: string;
  title: string;
  content: string;
  targetPosition: string | null;
  targetCompany: string | null;
  version: number;
  isDefault: boolean;
  createdAt: string;
}

interface PersonalInfoItem {
  id?: string;
  name: string;
  phone: string;
  email: string;
  school: string;
  major: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkExpItem {
  id: string;
  resumeId: string;
  companyName: string;
  baseLocation: string | null;
  position: string;
  startDate: string;
  endDate: string;
  coreWork: string;
  sortOrder: number;
  createdAt: string;
}

interface ProjExpItem {
  id: string;
  resumeId: string;
  projectName: string;
  companyName: string;
  position: string | null;
  startDate: string;
  endDate: string;
  process: string;
  results: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
}

interface BattleProjectSummary {
  id: string;
  projectName: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  tags: string[];
  summary: string;
}

// ── Mock Data（仅用于无数据库时的降级展示，均为空占位）──
const MOCK_PERSONAL_INFO: PersonalInfoItem = {
  id: 'pi-1',
  name: '',
  phone: '',
  email: '',
  school: '',
  major: '',
};

const MOCK_RESUMES: ResumeItem[] = [];

const MOCK_WORK_EXPERIENCES: WorkExpItem[] = [];

const MOCK_PROJECT_EXPERIENCES: ProjExpItem[] = [];

// ── 辅助：格式化日期 ──
function fmtDate(d: string): string {
  if (!d) return '';
  const m = d.match(/(\d{4})[年.\-/]?\s*(\d{1,2})?/);
  if (m) return m[2] ? `${m[1]}年${m[2]}月` : `${m[1]}年`;
  return d;
}

// ════════════════════════════════════════════
// 页面主组件
// ════════════════════════════════════════════

export default function IdentityPage() {
  // ── 数据 hooks ──
  const {
    data: personalInfo, loading: piLoading,
    save: piSave,
  } = useApiSingle<PersonalInfoItem>({
    endpoint: '/api/personal-info',
    mockData: MOCK_PERSONAL_INFO,
  });

  const {
    data: resumes, loading: resumeLoading,
    create: resumeCreate, update: resumeUpdate, remove: resumeRemove,
  } = useApiList<ResumeItem>({ endpoint: '/api/resumes', mockData: MOCK_RESUMES });

  // ── 选中简历 ──
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // ── 个人信息 Modal ──
  const [piModalOpen, setPiModalOpen] = useState(false);
  const [piModalLoading, setPiModalLoading] = useState(false);
  const [piForm] = Form.useForm();

  // ── 简历 Modal ──
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeModalLoading, setResumeModalLoading] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeItem | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeItem | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [resumeForm] = Form.useForm();
  const [uploadAreaVisible, setUploadAreaVisible] = useState(false);

  // ── 工作经历 Modal ──
  const [weModalOpen, setWeModalOpen] = useState(false);
  const [weModalLoading, setWeModalLoading] = useState(false);
  const [editingWE, setEditingWE] = useState<WorkExpItem | null>(null);
  const [weForm] = Form.useForm();

  // ── 项目经历 Modal ──
  const [peModalOpen, setPeModalOpen] = useState(false);
  const [peModalLoading, setPeModalLoading] = useState(false);
  const [editingPE, setEditingPE] = useState<ProjExpItem | null>(null);
  const [peForm] = Form.useForm();

  // ── 导出弹窗状态 ──
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportResumeId, setExportResumeId] = useState<string | null>(null);
  const [exportData, setExportData] = useState<ExportResumeData | null>(null);
  const [exportHtml, setExportHtml] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // ── 内部战役导入 ──
  const [battleProjects, setBattleProjects] = useState<BattleProjectSummary[]>([]);
  const [battleLoading, setBattleLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const [checkedBattleIds, setCheckedBattleIds] = useState<Set<string>>(new Set());

  // ── 快速新增内部战役项目 ──
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddForm] = Form.useForm();

  const handleQuickAddBattle = async () => {
    try {
      const values = await quickAddForm.validateFields();
      setQuickAddLoading(true);
      const res = await fetch('/api/battle-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: values.companyId,
          projectName: values.projectName.trim(),
          role: values.role.trim(),
          startDate: values.startDate || '',
          endDate: values.endDate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || '创建失败');
        return;
      }
      const created = await res.json();
      message.success(`已创建项目「${created.projectName}」`);
      // 自动勾选新项目
      setCheckedBattleIds((prev) => new Set(prev).add(created.id));
      // 刷新列表
      await fetchBattleProjects();
      // 重置表单并收起
      quickAddForm.resetFields();
      setQuickAddOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('创建失败，请重试');
    } finally { setQuickAddLoading(false); }
  };

  const fetchBattleProjects = async () => {
    setBattleLoading(true);
    try {
      const [bpRes, coRes] = await Promise.all([
        fetch('/api/battle-projects'),
        fetch('/api/companies'),
      ]);
      if (bpRes.ok) {
        const json = await bpRes.json();
        setBattleProjects(json.map((bp: any) => {
          const goalText = (bp.goal || bp.origin || '').replace(/<[^>]*>/g, '').trim();
          return {
            id: bp.id,
            projectName: bp.projectName || '',
            companyName: bp.company?.name || '',
            role: bp.role || '',
            startDate: bp.startDate || '',
            endDate: bp.endDate || null,
            tags: bp.tags || [],
            summary: goalText.length > 80 ? goalText.slice(0, 80) + '…' : goalText,
          };
        }));
      }
      if (coRes.ok) {
        const json = await coRes.json();
        setCompanyOptions(json.map((c: any) => ({ label: c.name, value: c.id })));
      }
    } catch { /* 静默降级 */ }
    finally { setBattleLoading(false); }
  };

  // ── 经历 hooks（endpoint 随 selectedResumeId 变化自动重新拉取）──
  const workExpsHook = useApiList<WorkExpItem>({
    endpoint: selectedResumeId ? `/api/work-experiences?resumeId=${selectedResumeId}` : '/api/work-experiences?resumeId=none',
    mockData: selectedResumeId
      ? MOCK_WORK_EXPERIENCES.filter((e) => e.resumeId === selectedResumeId)
      : [],
    fetchOnMount: !!selectedResumeId,
  });

  const projExpsHook = useApiList<ProjExpItem>({
    endpoint: selectedResumeId ? `/api/project-experiences?resumeId=${selectedResumeId}` : '/api/project-experiences?resumeId=none',
    mockData: selectedResumeId
      ? MOCK_PROJECT_EXPERIENCES.filter((e) => e.resumeId === selectedResumeId)
      : [],
    fetchOnMount: !!selectedResumeId,
  });

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === selectedResumeId) || null,
    [resumes, selectedResumeId]
  );

  // ── 个人信息 保存 ──
  const openPiModal = () => {
    piForm.setFieldsValue({
      name: personalInfo?.name || '',
      phone: personalInfo?.phone || '',
      email: personalInfo?.email || '',
      school: personalInfo?.school || '',
      major: personalInfo?.major || '',
    });
    setPiModalOpen(true);
  };

  const handlePiSave = async () => {
    try {
      const values = await piForm.validateFields();
      setPiModalLoading(true);
      await piSave(values);
      message.success('个人信息已保存');
      setPiModalOpen(false);
    } catch (err) {
      // 表单校验失败时 AntD 已标红；其余为服务器错误，必须提示
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('保存失败，请检查网络后重试');
    }
    finally { setPiModalLoading(false); }
  };

  // ── 简历 操作 ──
  const openCreateResume = () => {
    setEditingResume(null); setUploadAreaVisible(false);
    resumeForm.resetFields();
    setCheckedBattleIds(new Set());
    fetchBattleProjects();
    setResumeModalOpen(true);
  };
  const openEditResume = (item: ResumeItem) => {
    setEditingResume(item); setUploadAreaVisible(false);
    resumeForm.setFieldsValue({
      title: item.title,
      targetPosition: item.targetPosition ?? undefined,
      targetCompany: item.targetCompany ?? undefined,
      version: item.version, isDefault: item.isDefault,
    });
    setResumeModalOpen(true);
  };
  const handleResumeSave = async () => {
    try {
      const values = await resumeForm.validateFields(); setResumeModalLoading(true);
      // 新建不再收集备注（content 置空）；编辑保留旧备注不动
      const payload: Record<string, unknown> = {
        title: values.title,
        targetPosition: values.targetPosition ?? null,
        targetCompany: values.targetCompany ?? null,
        version: values.version ?? 1, isDefault: values.isDefault ?? false,
      };
      if (!editingResume) payload.content = '';
      if (editingResume) { await resumeUpdate(editingResume.id, payload); message.success('简历已更新'); }
      else {
        // ── 过滤出有内容的经历行，并校验必填项 ──
        const hasContent = (row: any) => row && Object.values(row).some((v) => typeof v === 'string' && v.trim());
        const wes = (values.workExperiences || []).filter(hasContent);
        const pes = (values.projectExperiences || []).filter(hasContent);
        for (let i = 0; i < wes.length; i++) {
          const w = wes[i];
          if (!w.companyName?.trim() || !w.position?.trim() || !w.startDate?.trim() || !w.endDate?.trim()) {
            message.error(`第 ${i + 1} 条工作经历缺少公司/岗位/任职时间，请补全或删除该条`);
            return;
          }
        }
        for (let i = 0; i < pes.length; i++) {
          const p = pes[i];
          if (!p.projectName?.trim() || !p.companyName?.trim() || !p.startDate?.trim() || !p.endDate?.trim()) {
            message.error(`第 ${i + 1} 条项目经历缺少项目名/公司/时间段，请补全或删除该条`);
            return;
          }
        }

        const created = await resumeCreate(payload);
        if (created) {
          setSelectedResumeId(created.id);
          // ── 逐条提交经历（本地降级 id 跳过，避免打到不存在的接口）──
          let failCount = 0;
          let battleSyncCount = 0;
          if (!created.id.startsWith('local-')) {
            for (const w of wes) {
              try {
                const r = await fetch('/api/work-experiences', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...w, resumeId: created.id }),
                });
                if (!r.ok) failCount++;
              } catch { failCount++; }
            }
            for (const p of pes) {
              try {
                const r = await fetch('/api/project-experiences', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...p, resumeId: created.id }),
                });
                if (!r.ok) failCount++;
              } catch { failCount++; }
            }
            // ── 同步勾选的内部战役项目 ──
            for (const bpId of checkedBattleIds) {
              try {
                const r = await fetch(`/api/battle-projects/${bpId}/sync-to-resume`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ resumeId: created.id }),
                });
                if (r.ok) battleSyncCount++;
              } catch { /* 单个失败不阻塞 */ }
            }
          }
          // 新建后自动选中该简历 → 经历编辑弹窗自动打开
          if (failCount > 0) {
            message.warning(`简历已创建，但有 ${failCount} 条经历保存失败，请在弹窗中补录`);
          } else {
            const total = wes.length + pes.length;
            const parts: string[] = [];
            if (total > 0) parts.push(`${wes.length} 条工作经历、${pes.length} 条项目经历`);
            if (battleSyncCount > 0) parts.push(`从内部战役导入 ${battleSyncCount} 个项目`);
            message.success(parts.length > 0
              ? `简历已创建（${parts.join('，')}）`
              : '简历已创建，可在弹窗中继续添加经历');
          }
        }
      }
      setResumeModalOpen(false);
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('保存失败，请检查网络后重试');
    }
    finally { setResumeModalLoading(false); }
  };
  const handleDeleteResume = (item: ResumeItem) => {
    if (selectedResumeId === item.id) setSelectedResumeId(null);
    resumeRemove(item.id); message.success('简历已删除');
  };
  const handleToggleDefault = (item: ResumeItem) => {
    resumeUpdate(item.id, { isDefault: !item.isDefault });
    message.success(item.isDefault ? '已取消默认' : '已设为默认简历');
  };
  const handleCopyResume = async (item: ResumeItem) => {
    const created = await resumeCreate({
      title: `${item.title}（副本）`, content: item.content,
      targetPosition: item.targetPosition, targetCompany: item.targetCompany,
      version: 1, isDefault: false,
    });
    // 连带复制源简历的工作/项目经历（本地降级产生的 local- 开头 id 跳过）
    if (created && !created.id.startsWith('local-')) {
      try {
        const [wes, pes] = await Promise.all([
          fetch(`/api/work-experiences?resumeId=${item.id}`).then((r) => (r.ok ? r.json() : [])),
          fetch(`/api/project-experiences?resumeId=${item.id}`).then((r) => (r.ok ? r.json() : [])),
        ]);
        for (const we of wes as WorkExpItem[]) {
          await fetch('/api/work-experiences', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeId: created.id, companyName: we.companyName, baseLocation: we.baseLocation,
              position: we.position, startDate: we.startDate, endDate: we.endDate, coreWork: we.coreWork,
            }),
          });
        }
        for (const pe of pes as ProjExpItem[]) {
          await fetch('/api/project-experiences', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeId: created.id, projectName: pe.projectName, companyName: pe.companyName,
              position: pe.position, startDate: pe.startDate, endDate: pe.endDate,
              process: pe.process, results: pe.results,
            }),
          });
        }
        message.success(`已复制简历（含 ${wes.length} 条工作经历、${pes.length} 条项目经历）`);
        return;
      } catch { /* 经历复制失败时退化为仅复制简历本体 */ }
    }
    message.success('已复制简历');
  };
  const handleResumeParsed = (attachment: any) => {
    if (attachment.parsedText) {
      resumeForm.setFieldsValue({ content: attachment.parsedText });
      message.success('文档内容已填充到编辑器，请检查并调整');
    }
  };

  // ── 工作经历 操作 ──
  const openCreateWE = () => {
    setEditingWE(null);
    weForm.resetFields();
    setWeModalOpen(true);
  };
  const openEditWE = (item: WorkExpItem) => {
    setEditingWE(item);
    weForm.setFieldsValue({
      companyName: item.companyName, baseLocation: item.baseLocation,
      position: item.position, startDate: item.startDate, endDate: item.endDate,
      coreWork: item.coreWork,
    });
    setWeModalOpen(true);
  };
  const handleWESave = async () => {
    try {
      const values = await weForm.validateFields(); setWeModalLoading(true);
      const payload = { ...values, resumeId: selectedResumeId };
      if (editingWE) { await workExpsHook.update(editingWE.id, payload); message.success('工作经历已更新'); }
      else { await workExpsHook.create(payload); message.success('工作经历已添加'); }
      setWeModalOpen(false);
    } catch { /* validation */ }
    finally { setWeModalLoading(false); }
  };
  const handleWEDelete = (item: WorkExpItem) => {
    workExpsHook.remove(item.id); message.success('已删除工作经历');
  };

  // ── 项目经历 操作 ──
  const openCreatePE = () => {
    setEditingPE(null);
    peForm.resetFields();
    setPeModalOpen(true);
  };
  const openEditPE = (item: ProjExpItem) => {
    setEditingPE(item);
    peForm.setFieldsValue({
      projectName: item.projectName, companyName: item.companyName,
      position: item.position, startDate: item.startDate, endDate: item.endDate,
      process: item.process, results: item.results,
    });
    setPeModalOpen(true);
  };
  const handlePESave = async () => {
    try {
      const values = await peForm.validateFields(); setPeModalLoading(true);
      const payload = { ...values, resumeId: selectedResumeId };
      if (editingPE) { await projExpsHook.update(editingPE.id, payload); message.success('项目经历已更新'); }
      else { await projExpsHook.create(payload); message.success('项目经历已添加'); }
      setPeModalOpen(false);
    } catch { /* validation */ }
    finally { setPeModalLoading(false); }
  };
  const handlePEDelete = (item: ProjExpItem) => {
    projExpsHook.remove(item.id); message.success('已删除项目经历');
  };

  // ── 经历排序：与相邻项交换 sortOrder 后重新拉取 ──
  const handleMove = async (
    hook: {
      data: { id: string; sortOrder: number }[];
      update: (id: string, changes: { sortOrder: number }) => Promise<unknown>;
      refetch: () => Promise<void>;
    },
    index: number, dir: -1 | 1
  ) => {
    const list = hook.data || [];
    const cur = list[index];
    const other = list[index + dir];
    if (!cur || !other) return;
    await hook.update(cur.id, { sortOrder: other.sortOrder });
    await hook.update(other.id, { sortOrder: cur.sortOrder });
    await hook.refetch();
  };

  // ── 导出数据组装（导出与预览共用）──
  const buildExportData = (
    resume: ResumeItem, wes: WorkExpItem[], pes: ProjExpItem[]
  ): ExportResumeData => ({
    personalInfo: {
      name: personalInfo?.name || '未填写',
      phone: personalInfo?.phone || '',
      email: personalInfo?.email || '',
      school: personalInfo?.school || '',
      major: personalInfo?.major || '',
    },
    resume: {
      title: resume.title,
      targetPosition: resume.targetPosition,
      targetCompany: resume.targetCompany,
      version: resume.version,
      content: resume.content,
    },
    workExperiences: wes.map((we) => ({
      companyName: we.companyName,
      baseLocation: we.baseLocation,
      position: we.position,
      startDate: we.startDate,
      endDate: we.endDate,
      coreWork: we.coreWork,
    })),
    projectExperiences: pes.map((pe) => ({
      projectName: pe.projectName,
      companyName: pe.companyName,
      position: pe.position,
      startDate: pe.startDate,
      endDate: pe.endDate,
      process: pe.process,
      results: pe.results,
    })),
  });

  // ── 拉取某份简历的工作/项目经历（预览与卡片快捷导出共用）──
  const fetchExperiences = async (resumeId: string): Promise<[WorkExpItem[], ProjExpItem[]]> => {
    const [wes, pes] = await Promise.all([
      fetch(`/api/work-experiences?resumeId=${resumeId}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/project-experiences?resumeId=${resumeId}`).then((r) => (r.ok ? r.json() : [])),
    ]);
    return [wes, pes];
  };

  // ── 简历预览：拉取该简历的经历，渲染与导出一致的 HTML ──
  const openPreview = async (item: ResumeItem) => {
    setPreviewResume(item);
    setPreviewHtml(null);
    setPreviewLoading(true);
    try {
      const [wes, pes] = await fetchExperiences(item.id);
      setPreviewHtml(generateExportHTML(buildExportData(item, wes, pes)));
    } catch {
      setPreviewHtml(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── 导出弹窗：加载指定简历的预览数据 ──
  const loadExport = async (resumeId: string) => {
    const resume = resumes.find((r) => r.id === resumeId);
    if (!resume) return;
    setExportResumeId(resumeId);
    setExportLoading(true);
    try {
      const [wes, pes] = await fetchExperiences(resumeId);
      const data = buildExportData(resume, wes, pes);
      setExportData(data);
      setExportHtml(generateExportHTML(data));
    } catch {
      setExportData(null);
      setExportHtml(null);
    } finally {
      setExportLoading(false);
    }
  };

  // ── 打开导出弹窗（默认选中当前简历，否则第一份）──
  const openExportModal = (resumeId?: string) => {
    const id = resumeId || selectedResumeId || resumes[0]?.id || null;
    setExportModalOpen(true);
    setExportData(null);
    setExportHtml(null);
    setExportResumeId(id);
    if (id) loadExport(id);
  };

  // ── 弹窗内执行导出 ──
  const handleModalExport = (format: 'html' | 'md') => {
    if (!exportData) return;
    if (format === 'html') {
      exportAsHTML(exportData);
      message.success('简历已在新窗口打开，可使用 Ctrl+P 打印为 PDF');
    } else {
      exportAsMD(exportData);
      message.success('Markdown 简历下载中');
    }
  };

  // ════════════════════════════════════════════
  // 渲染
  // ════════════════════════════════════════════

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* ── 页面标题 + 导出入口（右上）── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>身份铭牌 · 我的简历</Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            管理个人信息与简历版本，一键导出标准格式简历
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<ExportOutlined />}
          onClick={() => openExportModal()}
          disabled={resumes.length === 0}
          style={{ borderRadius: 8 }}
        >
          导出简历
        </Button>
      </div>

      {/* ════════════════════════════════════
          区域一：个人信息卡片
          ════════════════════════════════════ */}
      <Card
        style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', marginBottom: 24 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <IdcardOutlined style={{ fontSize: 18, color: '#8b7cf0' }} />
            <Text strong style={{ fontSize: 15 }}>个人信息</Text>
            <Tag color="blue" style={{ borderRadius: 8, fontSize: 11 }}>默认版块</Tag>
          </Space>
          <Button icon={<EditOutlined />} onClick={openPiModal} style={{ borderRadius: 8 }} size="small">
            编辑
          </Button>
        </div>
        {piLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : personalInfo && personalInfo.name ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 32px' }}>
            <div><Space><UserOutlined style={{ color: '#8b7cf0' }} /><Text type="secondary" style={{ fontSize: 13 }}>姓名</Text></Space><div><Text strong style={{ fontSize: 14 }}>{personalInfo.name}</Text></div></div>
            <div><Space><PhoneOutlined style={{ color: '#52c41a' }} /><Text type="secondary" style={{ fontSize: 13 }}>电话</Text></Space><div><Text style={{ fontSize: 14 }}>{personalInfo.phone || '未填写'}</Text></div></div>
            <div><Space><MailOutlined style={{ color: '#1677ff' }} /><Text type="secondary" style={{ fontSize: 13 }}>邮箱</Text></Space><div><Text style={{ fontSize: 14 }}>{personalInfo.email || '未填写'}</Text></div></div>
            <div><Space><HomeOutlined style={{ color: '#fa8c16' }} /><Text type="secondary" style={{ fontSize: 13 }}>学校</Text></Space><div><Text style={{ fontSize: 14 }}>{personalInfo.school || '未填写'}</Text></div></div>
            <div><Space><BookOutlined style={{ color: '#eb2f96' }} /><Text type="secondary" style={{ fontSize: 13 }}>专业</Text></Space><div><Text style={{ fontSize: 14 }}>{personalInfo.major || '未填写'}</Text></div></div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Text type="secondary">尚未填写个人信息，点击"编辑"开始</Text>
          </div>
        )}
      </Card>

      {/* ════════════════════════════════════
          区域二：简历版本卡片网格
          ════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <FileTextOutlined style={{ color: '#8b7cf0' }} />
            <Text strong style={{ fontSize: 15 }}>简历版本</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>共 {resumes.length} 份 · 点击卡片编辑经历</Text>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateResume} style={{ borderRadius: 8 }}>
            新增简历
          </Button>
        </div>

        {resumeLoading ? (
          <Card style={{ borderRadius: 8, textAlign: 'center', padding: 40 }}>
            <Spin />
          </Card>
        ) : resumes.length === 0 ? (
          <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', textAlign: 'center', padding: 24 }}>
            <Empty description="暂无简历版本，点击「新增简历」开始创建" />
          </Card>
        ) : (
          <Row gutter={[14, 14]}>
            {resumes.map((item) => {
              const isSelected = selectedResumeId === item.id;
              return (
                <Col xs={24} sm={12} lg={6} key={item.id}>
                  <Card
                    hoverable
                    onClick={() => {
                      const nextId = isSelected ? null : item.id;
                      setSelectedResumeId(nextId);
                      if (nextId) fetchBattleProjects();
                    }}
                    style={{
                      borderRadius: 8,
                      boxShadow: isSelected
                        ? '0 0 0 2px #8b7cf0, 0 2px 8px rgba(139,124,240,0.15)'
                        : '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                      height: '100%',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #8b7cf0' : '1px solid #f0f0f0',
                    }}
                    styles={{ body: { padding: '14px 16px 10px' } }}
                    actions={[
                      <Tooltip title="编辑" key="edit">
                        <EditOutlined onClick={(e) => { e.stopPropagation(); openEditResume(item); }} />
                      </Tooltip>,
                      <Tooltip title="预览" key="preview">
                        <EyeOutlined onClick={(e) => { e.stopPropagation(); openPreview(item); }} />
                      </Tooltip>,
                      <Tooltip title="导出简历" key="export">
                        <ExportOutlined onClick={(e) => { e.stopPropagation(); openExportModal(item.id); }} />
                      </Tooltip>,
                      <Tooltip title="复制" key="copy">
                        <CopyOutlined onClick={(e) => { e.stopPropagation(); handleCopyResume(item); }} />
                      </Tooltip>,
                      <Tooltip title={item.isDefault ? '取消默认' : '设为默认'} key="star">
                        <span onClick={(e) => { e.stopPropagation(); handleToggleDefault(item); }}>
                          {item.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        </span>
                      </Tooltip>,
                      <Popconfirm key="delete" title="确认删除此简历？删除后关联的工作/项目经历也会被删除" onConfirm={(e) => { e?.stopPropagation(); handleDeleteResume(item); }} onCancel={(e) => e?.stopPropagation()} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
                        <Tooltip title="删除">
                          <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={(e) => e.stopPropagation()} />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FileTextOutlined style={{ fontSize: 16, color: isSelected ? '#8b7cf0' : '#bbb' }} />
                      <Text strong style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Text>
                      {item.isDefault && <Badge count="默认" style={{ backgroundColor: '#faad14', color: '#fff', fontSize: 11 }} />}
                      {isSelected && <Badge count="当前" style={{ backgroundColor: '#8b7cf0', color: '#fff', fontSize: 11 }} />}
                    </div>
                    {(item.targetPosition || item.targetCompany) && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        目标：{[item.targetPosition, item.targetCompany].filter(Boolean).join(' @ ')}
                      </Text>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Tag color="blue" style={{ borderRadius: 8, fontSize: 11, marginInlineEnd: 0 }}>V{item.version}</Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* ════════════════════════════════════
          经历编辑弹窗（点击简历卡片后弹出）
          ════════════════════════════════════ */}
      <Modal
        title={
          <Space>
            <Text strong style={{ fontSize: 15 }}>
              编辑经历：{selectedResume?.title}
            </Text>
            {selectedResume && <Tag color="blue" style={{ borderRadius: 8 }}>V{selectedResume.version}</Tag>}
            {selectedResume?.targetPosition && (
              <Tag color="cyan" style={{ borderRadius: 8 }}>{selectedResume.targetPosition}</Tag>
            )}
            <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => selectedResume && openExportModal(selectedResume.id)}>
              导出此版本
            </Button>
          </Space>
        }
        open={!!selectedResume}
        onCancel={() => setSelectedResumeId(null)}
        footer={null}
        width={920}
      >
          <div style={{ marginTop: 8 }}>
            <Divider orientation="left" style={{ margin: '0 0 12px', fontSize: 14 }}>工作经历（{workExpsHook.data?.length || 0}）</Divider>
                    {workExpsHook.loading ? (
                      <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
                    ) : !workExpsHook.data || workExpsHook.data.length === 0 ? (
                      <Empty description="暂无工作经历，点击上方按钮添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      workExpsHook.data.map((we, index) => (
                        <Card
                          key={we.id}
                          size="small"
                          style={{ borderRadius: 8, marginBottom: 12, border: '1px solid #f0f0f0' }}
                          styles={{ body: { padding: '16px 20px' } }}
                          extra={
                            <Space>
                              <Button type="link" size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => handleMove(workExpsHook, index, -1)} />
                              <Button type="link" size="small" icon={<ArrowDownOutlined />} disabled={index === workExpsHook.data.length - 1} onClick={() => handleMove(workExpsHook, index, 1)} />
                              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditWE(we)}>
                                编辑
                              </Button>
                              <Popconfirm title="确认删除？" onConfirm={() => handleWEDelete(we)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
                                <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                              </Popconfirm>
                            </Space>
                          }
                          title={
                            <Space>
                              <Text strong style={{ fontSize: 14 }}>{we.companyName}</Text>
                              {we.baseLocation && (
                                <Tag style={{ borderRadius: 8, fontSize: 11 }}><EnvironmentOutlined /> {we.baseLocation}</Tag>
                              )}
                            </Space>
                          }
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 13 }}>{we.position}</Text>
                            <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>
                              <CalendarOutlined /> {fmtDate(we.startDate)} - {fmtDate(we.endDate)}
                            </Text>
                          </div>
                          <div style={{ background: '#fafafa', borderRadius: 6, padding: '8px 12px' }}>
                            {we.coreWork ? (
                              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
                                {we.coreWork.split('\n').filter((l) => l.trim()).map((line, i) => (
                                  <li key={i}>{line.replace(/^\d+[.、．)\s]+/, '').trim()}</li>
                                ))}
                              </ol>
                            ) : (
                              <Text type="secondary" style={{ fontSize: 12 }}>暂无工作内容</Text>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={openCreateWE} style={{ borderRadius: 8, marginBottom: 8, marginTop: 4 }}>
                      添加工作经历
                    </Button>

            <Divider orientation="left" style={{ margin: '16px 0 12px', fontSize: 14 }}>项目经历</Divider>

                    {/* ── 统一项目列表（内部战役为数据源）── */}
                    {battleLoading ? (
                      <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
                    ) : battleProjects.length === 0 ? (
                      <Empty description="暂无内部战役项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => window.open('/battle/internal', '_blank')}>去内部战役创建</Button>
                      </Empty>
                    ) : (
                      <div style={{ border: '1px solid #f0f0f0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                        {battleProjects.map((bp, i) => {
                          const pe = projExpsHook.data?.find((p) => p.projectName === bp.projectName);
                          const imported = !!pe;
                          const overview = bp.tags.length > 0 ? '' : (bp.projectName || '');
                          return (
                            <div key={bp.id}
                              onClick={async () => {
                                if (imported) {
                                  // 已导入 → 移除
                                  if (!pe) return;
                                  try {
                                    await fetch(`/api/project-experiences/${pe.id}`, { method: 'DELETE' });
                                    projExpsHook.refetch();
                                    message.success(`已移除「${bp.projectName}」`);
                                  } catch { message.error('移除失败'); }
                                } else {
                                  // 未导入 → 导入
                                  try {
                                    const r = await fetch(`/api/battle-projects/${bp.id}/sync-to-resume`, {
                                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ resumeId: selectedResumeId }),
                                    });
                                    if (r.ok) { projExpsHook.refetch(); }
                                    else if (r.status !== 409) message.error('导入失败');
                                  } catch { message.error('网络错误'); }
                                }
                              }}
                              style={{
                                padding: '8px 16px', cursor: 'pointer',
                                borderBottom: i < battleProjects.length - 1 ? '1px solid #f5f5f5' : 'none',
                                background: imported ? '#fafafa' : '#fff',
                                transition: 'background 0.1s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = imported ? '#f5f5f5' : '#faf8ff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = imported ? '#fafafa' : '#fff'; }}
                              title={imported ? '点击移除' : '点击导入'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                  border: imported ? 'none' : '1.5px solid #d9d9d9',
                                  background: imported ? '#8b7cf0' : '#fff',
                                  color: '#fff', fontSize: 11, transition: 'all 0.15s',
                                }}>
                                  {imported ? '✓' : ''}
                                </span>
                                <Text strong style={{ fontSize: 13, flex: '0 0 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{bp.projectName}</Text>
                                <Text type="secondary" style={{ fontSize: 12, flex: '0 0 auto', whiteSpace: 'nowrap' }}>{bp.companyName} · {bp.role}</Text>
                                <div style={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden', alignItems: 'center' }}>
                                  {bp.tags.slice(0, 3).map((t, j) => (
                                    <Tag key={j} style={{ borderRadius: 4, margin: 0, fontSize: 10, color: '#8b7cf0', background: '#f5f0ff', border: 'none', padding: '0 5px', lineHeight: '18px', whiteSpace: 'nowrap' }}>{t}</Tag>
                                  ))}
                                </div>
                                <Text type="secondary" style={{ fontSize: 11, flex: '0 0 auto', whiteSpace: 'nowrap' }}>{fmtDate(bp.startDate)}{bp.endDate ? ` - ${fmtDate(bp.endDate)}` : ''}</Text>
                              </div>
                              {bp.summary && (
                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2, paddingLeft: 30, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bp.summary}</Text>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={openCreatePE} style={{ borderRadius: 8 }}>
                      手动添加项目经历
                    </Button>
          </div>
      </Modal>

      {/* ════════════════════════════════════
          Modal: 个人信息编辑
        title={<Space><IdcardOutlined /><span>编辑个人信息</span></Space>}
        open={piModalOpen}
        onOk={handlePiSave}
        onCancel={() => setPiModalOpen(false)}
        confirmLoading={piModalLoading}
        okText="保存" cancelText="取消"
        width={480}
        destroyOnHidden
      >
        <Form form={piForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="你的姓名" prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="手机号" prefix={<PhoneOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="邮箱地址" prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="school" label="学校">
                <Input placeholder="毕业院校" prefix={<HomeOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="major" label="专业">
                <Input placeholder="所学专业" prefix={<BookOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ════════════════════════════════════
          Modal: 简历版本 创建/编辑
          ════════════════════════════════════ */}
      <Modal
        title={<Space>{editingResume ? <EditOutlined /> : <PlusOutlined />}<span>{editingResume ? '编辑简历' : '新增简历'}</span></Space>}
        open={resumeModalOpen}
        onOk={handleResumeSave}
        onCancel={() => setResumeModalOpen(false)}
        confirmLoading={resumeModalLoading}
        okText={editingResume ? '保存修改' : '创建'}
        cancelText="取消"
        width={720}
        destroyOnHidden
      >
        <Form form={resumeForm} layout="vertical" initialValues={{ version: 1, isDefault: false }} style={{ marginTop: 16 }}>
          {/* ── 板块一：简历版本 ── */}
          <Divider orientation="left" style={{ margin: '0 0 12px', fontSize: 14 }}>简历版本</Divider>
          <Form.Item name="title" label="简历标题" rules={[{ required: true, message: '请输入简历标题' }]}>
            <Input placeholder="如：高级前端工程师简历" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetPosition" label="目标岗位">
                <Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetCompany" label="目标公司">
                <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── 板块二：工作经历（仅新建时内嵌，编辑时在下方经历面板维护）── */}
          {!editingResume && (
            <>
              <Divider orientation="left" style={{ margin: '8px 0 12px', fontSize: 14 }}>工作经历（可选，可无限新增）</Divider>
              <Form.List name="workExperiences">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, idx) => (
                      <div key={field.key} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px 0', marginBottom: 12, background: '#fafafa', position: 'relative' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>工作经历 #{idx + 1}</Text>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} style={{ position: 'absolute', top: 8, right: 8 }} />
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'companyName']} label="公司名称">
                              <Input placeholder="如：某科技有限公司" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'baseLocation']} label="Base 地">
                              <Input placeholder="如：北京" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name={[field.name, 'position']} label="岗位">
                              <Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name={[field.name, 'startDate']} label="任职开始">
                              <Input placeholder="如 2022-03" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name={[field.name, 'endDate']} label="任职结束">
                              <Input placeholder="如 至今 或 2024-06" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item name={[field.name, 'coreWork']} label="核心工作内容" extra="每行一个要点">
                          <TextArea rows={3} placeholder={'1. 负责XX业务前端架构设计\n2. 推动XX技术落地'} style={{ borderRadius: 8 }} />
                        </Form.Item>
                      </div>
                    ))}
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ borderRadius: 8, marginBottom: 16 }}>
                      添加工作经历
                    </Button>
                  </>
                )}
              </Form.List>

              {/* ── 内部战役项目看板 ── */}
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>内部战役项目</Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 14 }}>
                勾选要导入的项目，已选 <Text strong style={{ color: '#8b7cf0' }}>{checkedBattleIds.size}</Text> 个
              </Text>

              {battleLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
              ) : battleProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, background: '#fafafa', borderRadius: 10, marginBottom: 16 }}>
                  <Empty description="暂无内部战役项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setQuickAddOpen(true)}>创建第一个项目</Button>
                  </Empty>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginBottom: 16, maxHeight: 360, overflowY: 'auto' }}>
                  {battleProjects.map((bp) => {
                    const checked = checkedBattleIds.has(bp.id);
                    return (
                      <div key={bp.id}
                        onClick={() => {
                          setCheckedBattleIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(bp.id)) next.delete(bp.id); else next.add(bp.id);
                            return next;
                          });
                        }}
                        style={{
                          padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                          border: checked ? '2px solid #8b7cf0' : '1px solid #f0f0f0',
                          background: checked ? '#faf8ff' : '#fff',
                          transition: 'all 0.15s', position: 'relative',
                        }}
                      >
                        {checked && (
                          <div style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#8b7cf0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>✓</div>
                        )}
                        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bp.projectName}</Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{bp.companyName} · {bp.role}</Text>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4, minHeight: 20 }}>
                          {bp.tags.length > 0
                            ? bp.tags.slice(0, 3).map((t, i) => (
                                <Tag key={i} style={{ borderRadius: 6, margin: 0, fontSize: 10, color: '#8b7cf0', background: '#f5f0ff', border: 'none', padding: '0 6px', lineHeight: '18px' }}>{t}</Tag>
                              ))
                            : <Text style={{ fontSize: 11, color: '#ddd' }}>暂无标签</Text>
                          }
                        </div>
                        {bp.summary && (
                          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bp.summary}</Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {fmtDate(bp.startDate)}{bp.endDate ? ` - ${fmtDate(bp.endDate)}` : ' - 至今'}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── 快速新增项目到内部战役 ── */}
              {!quickAddOpen ? (
                <Button type="link" icon={<PlusOutlined />} onClick={() => setQuickAddOpen(true)}
                  style={{ borderRadius: 8, padding: 0, marginTop: 4 }}>
                  新增项目到内部战役
                </Button>
              ) : (
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 10, padding: '16px 20px 4px', marginTop: 12, background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13 }}>快速新增项目</Text>
                    <Button type="text" size="small" onClick={() => { quickAddForm.resetFields(); setQuickAddOpen(false); }}
                      style={{ color: '#bbb', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</Button>
                  </div>
                  <Form form={quickAddForm} layout="vertical" size="small">
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: '必填' }]}>
                          <Input placeholder="如：微前端架构统一" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="role" label="项目岗位" rules={[{ required: true, message: '必填' }]}>
                          <Input placeholder="如：高级前端工程师" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="companyId" label="公司" rules={[{ required: true, message: '请选择公司' }]}>
                      <Select
                        showSearch
                        placeholder="搜索并选择公司…"
                        filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
                        options={companyOptions}
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="startDate" label="开始时间">
                          <Input placeholder="如 2025-03" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="endDate" label="结束时间">
                          <Input placeholder="至今可不填" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button type="primary" size="small" onClick={handleQuickAddBattle} loading={quickAddLoading}
                      style={{ borderRadius: 6, marginBottom: 16 }}>
                      创建并导入
                    </Button>
                  </Form>
                </div>
              )}
            </>
          )}

        </Form>
        {editingResume && (
          <>
            <Divider orientation="left" style={{ margin: '16px 0 12px' }}>简历文件</Divider>
            <div style={{ marginBottom: 12 }}>
              <Button icon={<UploadOutlined />} onClick={() => setUploadAreaVisible((v) => !v)} size="small">
                {uploadAreaVisible ? '收起上传' : '上传简历文件'}
              </Button>
            </div>
            {uploadAreaVisible && (
              <FileUpload entityType="resume" entityId={editingResume.id} onSuccess={() => {
                message.success('文件上传成功，请点击"解析文档"提取内容');
              }} accept=".pdf,.jpg,.jpeg,.png,.md" />
            )}
            <AttachmentList entityType="resume" entityId={editingResume.id} onParsed={handleResumeParsed} />
          </>
        )}
      </Modal>

      {/* ════════════════════════════════════
          Modal: 工作经历 创建/编辑
          ════════════════════════════════════ */}
      <Modal
        title={<Space><OrderedListOutlined /><span>{editingWE ? '编辑工作经历' : '添加工作经历'}</span></Space>}
        open={weModalOpen}
        onOk={handleWESave}
        onCancel={() => setWeModalOpen(false)}
        confirmLoading={weModalLoading}
        okText={editingWE ? '保存修改' : '添加'}
        cancelText="取消"
        width={620}
        destroyOnHidden
      >
        <Form form={weForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="companyName" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
            <Input placeholder="如：某科技有限公司" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
                <Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="baseLocation" label="Base 地">
                <Input placeholder="如：北京" prefix={<EnvironmentOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="任职开始" rules={[{ required: true, message: '请选择或输入开始时间' }]}>
                <Input placeholder="如 2022-03 或 2022年3月" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="任职结束" rules={[{ required: true, message: '请选择或输入结束时间' }]}>
                <Input placeholder="如 至今 或 2024-06" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="coreWork" label="核心工作内容" extra="每行一个要点，可用「1. 要点内容」格式编写">
            <TextArea rows={6} placeholder={'1. 负责XX业务前端架构设计\n2. 推动XX技术落地\n3. ...'} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ════════════════════════════════════
          Modal: 项目经历 创建/编辑
          ════════════════════════════════════ */}
      <Modal
        title={<Space><FileTextOutlined /><span>{editingPE ? '编辑项目经历' : '添加项目经历'}</span></Space>}
        open={peModalOpen}
        onOk={handlePESave}
        onCancel={() => setPeModalOpen(false)}
        confirmLoading={peModalLoading}
        okText={editingPE ? '保存修改' : '添加'}
        cancelText="取消"
        width={620}
        destroyOnHidden
      >
        <Form form={peForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="如：微前端平台建设" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyName" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
                <Input placeholder="如：某科技有限公司" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="岗位">
                <Input placeholder="如：前端负责人" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="startDate" label="开始时间" rules={[{ required: true, message: '必填' }]}>
                <Input placeholder="如 2022-06" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="endDate" label="结束时间" rules={[{ required: true, message: '必填' }]}>
                <Input placeholder="如 2023-03" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="process" label="项目过程" extra="每行一个要点">
            <TextArea rows={4} placeholder={'1. 调研主流微前端方案\n2. 设计子应用通信协议\n3. ...'} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="results" label="项目成果" extra="每行一个要点">
            <TextArea rows={4} placeholder={'1. 支撑5个业务线独立部署\n2. 构建时间缩短60%\n3. ...'} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ════════════════════════════════════
          Modal: 导出简历（左预览 + 右选择）
          ════════════════════════════════════ */}
      <Modal
        title={<Space><ExportOutlined /><span>导出简历</span></Space>}
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        width={1040}
        footer={
          <Space>
            <Button onClick={() => handleModalExport('md')} disabled={!exportData}>
              导出 Markdown
            </Button>
            <Button type="primary" icon={<ExportOutlined />} onClick={() => handleModalExport('html')} disabled={!exportData}>
              导出 HTML
            </Button>
          </Space>
        }
      >
        <Row gutter={20} style={{ marginTop: 8 }}>
          {/* ── 左：实时预览 ── */}
          <Col span={15}>
            {exportLoading ? (
              <div style={{ textAlign: 'center', padding: 120 }}><Spin /></div>
            ) : exportHtml ? (
              <iframe
                srcDoc={exportHtml}
                title="导出预览"
                style={{ width: '100%', height: 560, border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Empty description="请在右侧选择要导出的简历版本" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Col>
          {/* ── 右：个人信息 + 版本选择 ── */}
          <Col span={9}>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 14 }}>个人信息</Text>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => { setExportModalOpen(false); openPiModal(); }}>
                  编辑
                </Button>
              </div>
              {personalInfo && personalInfo.name ? (
                <Space direction="vertical" size={2} style={{ fontSize: 13 }}>
                  <Text style={{ fontSize: 13 }}>姓名：{personalInfo.name}</Text>
                  <Text style={{ fontSize: 13 }}>电话：{personalInfo.phone || '未填写'}</Text>
                  <Text style={{ fontSize: 13 }}>邮箱：{personalInfo.email || '未填写'}</Text>
                  <Text style={{ fontSize: 13 }}>学校：{personalInfo.school || '未填写'}</Text>
                  <Text style={{ fontSize: 13 }}>专业：{personalInfo.major || '未填写'}</Text>
                </Space>
              ) : (
                <Text type="secondary" style={{ fontSize: 13 }}>尚未填写个人信息，点右上角「编辑」补全</Text>
              )}
            </div>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>选择简历版本</Text>
            <Radio.Group
              value={exportResumeId}
              onChange={(e) => loadExport(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}
            >
              {resumes.map((r) => (
                <Radio key={r.id} value={r.id} style={{ fontSize: 13 }}>
                  {r.title}（V{r.version}）
                  {r.isDefault && <Tag color="gold" style={{ borderRadius: 8, fontSize: 11, marginLeft: 6 }}>默认</Tag>}
                  {r.targetPosition && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>{r.targetPosition}</Text>
                  )}
                </Radio>
              ))}
            </Radio.Group>
          </Col>
        </Row>
      </Modal>

      {/* ════════════════════════════════════
          Modal: 简历预览（与导出效果一致）
          ════════════════════════════════════ */}
      <Modal
        title={<Space><EyeOutlined /><span>简历预览 - {previewResume?.title}</span></Space>}
        open={!!previewResume}
        onCancel={() => setPreviewResume(null)}
        footer={<Button onClick={() => setPreviewResume(null)}>关闭</Button>}
        width={720}
      >
        {previewResume && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue" style={{ borderRadius: 8 }}>V{previewResume.version}</Tag>
                {previewResume.targetPosition && <Tag color="cyan" style={{ borderRadius: 8 }}>{previewResume.targetPosition}</Tag>}
                {previewResume.targetCompany && <Tag color="purple" style={{ borderRadius: 8 }}>{previewResume.targetCompany}</Tag>}
                {previewResume.isDefault && <Badge count="默认" style={{ backgroundColor: '#faad14' }} />}
                <Text type="secondary" style={{ fontSize: 12 }}>与导出效果一致</Text>
              </Space>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            {previewLoading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="简历预览"
                style={{ width: '100%', height: 480, border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}
              />
            ) : (
              <Empty description="预览生成失败，请稍后重试" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
