'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import { Card, Button, Typography, Modal, Form, Input, Select, DatePicker, Tag, message, Popconfirm, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, SendOutlined, SearchOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const END_REASONS = ['简历挂', '面试挂', 'Ghost', '自己放弃', '已入职', '其他'];
const SOURCES = ['官网', '招聘App', '猎头', '内推', '其他'];
const STAGE_TABS = [
  { key: '全部', color: '#666' },
  { key: '未投递', color: '#8b7cf0', label: '意向池' },
  { key: '已投递', color: '#fa8c16', label: '等待反馈' },
  { key: '已结束', color: '#999', label: '归档' },
];

interface JobApplication {
  id: string; companyName: string; industry: string; positionName: string;
  salaryMin: number | null; salaryMax: number | null; location: string | null;
  currentStage: string; source: string | null; appliedDate: string | null;
  jdLink: string | null; jdText: string | null;
  resumeVersion: string | null; endReason: string | null;
  notes: string | null; createdAt: string;
  company?: { name: string; industry?: string; scale?: string; city?: string; website?: string };
}

function mapApp(item: any): JobApplication {
  return {
    id: item.id,
    companyName: item.company?.name || item.companyName || '',
    industry: item.industry || item.company?.industry || '',
    positionName: item.positionName || '',
    salaryMin: item.salaryMin ?? null,
    salaryMax: item.salaryMax ?? null,
    location: item.location || item.company?.city || null,
    currentStage: item.currentStage || '未投递',
    source: item.source || null,
    appliedDate: item.appliedDate || null,
    jdLink: item.jdLink || null,
    jdText: item.jdText || null,
    resumeVersion: item.resumeVersion || null,
    endReason: item.endReason || null,
    notes: item.notes || null,
    createdAt: item.createdAt || '',
    company: item.company,
  };
}

export default function ApplicationsPage() {
  const { data: apps, create, update, remove } = useApiList<JobApplication>({ endpoint: '/api/applications', mockData: [] });
  const mapped = useMemo(() => apps.map(mapApp), [apps]);

  const [tab, setTab] = useState('全部');
  const [search, setSearch] = useState('');

  // Detail drawer
  const [detail, setDetail] = useState<JobApplication | null>(null);

  // Edit modal
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  // Apply modal
  const [applyApp, setApplyApp] = useState<JobApplication | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyForm] = Form.useForm();

  // End modal
  const [endApp, setEndApp] = useState<JobApplication | null>(null);
  const [endOpen, setEndOpen] = useState(false);
  const [endReason, setEndReason] = useState('');

  // Quick add
  const [quickCompany, setQuickCompany] = useState('');
  const [quickPosition, setQuickPosition] = useState('');
  const [quickLink, setQuickLink] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const filtered = useMemo(() => {
    let list = tab === '全部' ? mapped : mapped.filter((a) => a.currentStage === tab);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((a) =>
        a.companyName.toLowerCase().includes(s) ||
        a.positionName.toLowerCase().includes(s) ||
        (a.industry && a.industry.toLowerCase().includes(s)) ||
        (a.location && a.location.toLowerCase().includes(s))
      );
    }
    return list;
  }, [mapped, tab, search]);

  const daysAgo = (date: string | null) => {
    if (!date) return null;
    const d = dayjs(date);
    const days = dayjs().diff(d, 'day');
    return days === 0 ? '今天' : `${days}天前`;
  };

  const stageCfg = (stage: string) => {
    const t = STAGE_TABS.find((s) => s.key === stage);
    return t || { key: stage, color: '#666', label: stage };
  };

  const stageBg = (stage: string) => {
    if (stage === '未投递') return '#f6f3ff';
    if (stage === '已投递') return '#fff7e6';
    if (stage === '面试') return '#e6f7ff';
    if (stage === 'offer') return '#f6ffed';
    return '#faf8f6';
  };

  // ─── Quick add ───
  const handleQuickAdd = async () => {
    if (!quickCompany.trim() || !quickPosition.trim()) return;
    setQuickAdding(true);
    await create({ companyName: quickCompany.trim(), positionName: quickPosition.trim(), jdLink: quickLink.trim() || null, currentStage: '未投递' } as any);
    setQuickCompany(''); setQuickPosition(''); setQuickLink('');
    setQuickAdding(false); setShowQuickAdd(false);
    message.success('已加入意向池');
  };

  // ─── Edit ───
  const openEdit = (app: JobApplication) => {
    setEditing(app);
    form.setFieldsValue({
      companyName: app.companyName,
      companyScale: app.company?.scale || null,
      companyCity: app.company?.city || null,
      companyWebsite: app.company?.website || null,
      industry: app.industry,
      positionName: app.positionName,
      location: app.location,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      source: app.source,
      appliedDate: app.appliedDate ? dayjs(app.appliedDate) : null,
      jdLink: app.jdLink,
      jdText: app.jdText,
      resumeVersion: app.resumeVersion,
      notes: app.notes,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields(); setEditLoading(true);
      const payload: any = {
        companyName: vals.companyName, companyScale: vals.companyScale || null,
        companyCity: vals.companyCity || null, companyWebsite: vals.companyWebsite || null,
        positionName: vals.positionName, industry: vals.industry || '',
        location: vals.location || null,
        salaryMin: vals.salaryMin ?? null, salaryMax: vals.salaryMax ?? null,
        source: vals.source || null,
        appliedDate: vals.appliedDate ? vals.appliedDate.toISOString() : null,
        jdLink: vals.jdLink || null, jdText: vals.jdText || null,
        resumeVersion: vals.resumeVersion || null, notes: vals.notes || null,
      };
      if (editing) { await update(editing.id, payload); message.success('已更新'); }
      setEditOpen(false);
    } catch { /* validation */ }
    finally { setEditLoading(false); }
  };

  // ─── Apply ───
  const openApply = (app: JobApplication) => { setApplyApp(app); applyForm.resetFields(); applyForm.setFieldsValue({ appliedDate: dayjs() }); setApplyOpen(true); };
  const handleApply = async () => {
    try {
      const vals = await applyForm.validateFields(); setApplyLoading(true);
      await update(applyApp!.id, { currentStage: '已投递', source: vals.source || null, location: vals.location || null, appliedDate: vals.appliedDate ? vals.appliedDate.toISOString() : new Date().toISOString(), jdText: vals.jdText || null, resumeVersion: vals.resumeVersion || null } as any);
      message.success('已投递！'); setApplyOpen(false); setApplyApp(null);
    } catch { }
    finally { setApplyLoading(false); }
  };

  // ─── End ───
  const openEnd = (app: JobApplication) => { setEndApp(app); setEndReason(''); setEndOpen(true); };
  const handleEnd = async () => {
    if (!endReason) return;
    await update(endApp!.id, { currentStage: '已结束', endReason } as any);
    message.success('已归档'); setEndOpen(false); setEndApp(null);
  };

  return (
    <div style={{ padding: '24px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>投递管理</Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 14 }}
          onClick={() => setShowQuickAdd(!showQuickAdd)}>快速添加</Button>
      </div>

      {/* Quick add bar */}
      {showQuickAdd && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: '14px 18px', background: '#f6f3ff', borderRadius: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input size="middle" placeholder="公司名称" value={quickCompany} onChange={(e) => setQuickCompany(e.target.value)} onPressEnter={handleQuickAdd} style={{ width: 150, borderRadius: 10 }} />
          <Input size="middle" placeholder="职位名称" value={quickPosition} onChange={(e) => setQuickPosition(e.target.value)} onPressEnter={handleQuickAdd} style={{ width: 180, borderRadius: 10 }} />
          <Input size="middle" placeholder="JD链接（选填）" value={quickLink} onChange={(e) => setQuickLink(e.target.value)} onPressEnter={handleQuickAdd} style={{ width: 220, borderRadius: 10 }} prefix={<LinkOutlined style={{ color: '#bbb' }} />} />
          <Button type="primary" icon={<PlusOutlined />} loading={quickAdding} onClick={handleQuickAdd} style={{ borderRadius: 10 }}>加入意向池</Button>
          <Button type="text" onClick={() => setShowQuickAdd(false)}>取消</Button>
        </div>
      )}

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGE_TABS.map((t) => (
            <Button key={t.key} size="small"
              type={tab === t.key ? 'primary' : 'default'}
              style={{ borderRadius: 14, background: tab === t.key ? t.color : '#fff', borderColor: tab === t.key ? t.color : '#e8e8e8', color: tab === t.key ? '#fff' : '#666', fontWeight: tab === t.key ? 600 : 400 }}
              onClick={() => setTab(t.key)}>
              {t.key}{t.key !== '全部' && <span style={{ marginLeft: 4, opacity: 0.8, fontSize: 11 }}>{mapped.filter((a) => a.currentStage === t.key).length}</span>}
            </Button>
          ))}
        </div>
        <Input size="small" placeholder="搜索公司/职位/行业/城市" prefix={<SearchOutlined style={{ color: '#bbb' }} />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 220, borderRadius: 14 }} />
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#bbb', fontSize: 15 }}>
          {tab === '未投递' ? '意向池是空的，点「快速添加」存第一个 JD' : '暂无记录'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {filtered.map((app) => {
            const cfg = stageCfg(app.currentStage);
            const days = daysAgo(app.appliedDate);
            return (
              <Card
                key={app.id}
                hoverable
                onClick={() => setDetail(app)}
                style={{
                  borderRadius: 14,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                styles={{ body: { padding: '12px 14px' } }}
              >
                {/* Status tag — top right */}
                <Tag style={{
                  position: 'absolute', top: 10, right: 10, margin: 0,
                  borderRadius: 8, fontSize: 10,
                  background: stageBg(app.currentStage), color: cfg.color,
                  border: `1px solid ${cfg.color}30`, padding: '1px 8px',
                }}>
                  {app.currentStage}{app.endReason ? ` · ${app.endReason}` : ''}
                </Tag>

                {/* Company name */}
                <Title level={5} style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, paddingRight: 60 }}>{app.companyName}</Title>

                {/* Position */}
                <Text style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 8 }}>{app.positionName}</Text>

                {/* Meta: industry + salary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {app.industry && (
                    <Tag style={{ borderRadius: 6, fontSize: 10, margin: 0, background: '#f0edff', color: '#7c6ff0', border: 'none', padding: '0 6px', lineHeight: '18px' }}>{app.industry}</Tag>
                  )}
                  {(app.salaryMin || app.salaryMax) ? (
                    <Text style={{ fontSize: 11, color: '#888' }}>{app.salaryMin || '?'}-{app.salaryMax || '?'}K</Text>
                  ) : null}
                  {app.location && (
                    <Text style={{ fontSize: 11, color: '#aaa' }}><EnvironmentOutlined style={{ fontSize: 10 }} /> {app.location}</Text>
                  )}
                </div>

                {/* Bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f5f5f5' }}>
                  <Text style={{ fontSize: 10, color: '#bbb' }}>{app.appliedDate ? dayjs(app.appliedDate).format('MM-DD') : ''}{app.source ? ` · ${app.source}` : ''}</Text>
                  <div style={{ display: 'flex', gap: 0 }} onClick={(e) => e.stopPropagation()}>
                    {app.currentStage === '未投递' && (
                      <Button size="small" type="primary" ghost style={{ borderRadius: 8, fontSize: 10, padding: '0 6px', height: 22 }} onClick={() => openApply(app)}>投递</Button>
                    )}
                    {app.currentStage === '已投递' && (
                      <Button size="small" type="text" danger icon={<CloseCircleOutlined style={{ fontSize: 11 }} />} style={{ borderRadius: 8, height: 22 }} onClick={() => openEnd(app)} />
                    )}
                    <Button size="small" type="text" icon={<EditOutlined style={{ fontSize: 11 }} />} style={{ borderRadius: 8, height: 22 }} onClick={() => openEdit(app)} />
                    <Popconfirm title="删除？" onConfirm={() => { remove(app.id); message.success('已删除'); }} okText="删" cancelText="否">
                      <Button size="small" type="text" danger icon={<DeleteOutlined style={{ fontSize: 11 }} />} style={{ borderRadius: 8, height: 22 }} />
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal
        title={null}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={560}
      >
        {detail && (() => {
          const cfg = stageCfg(detail.currentStage);
          return (
            <div style={{ padding: '4px 0' }}>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Tag style={{ borderRadius: 10, fontSize: 12, background: stageBg(detail.currentStage), color: cfg.color, border: `1px solid ${cfg.color}30`, padding: '3px 12px' }}>
                    {detail.currentStage}{detail.endReason ? ` · ${detail.endReason}` : ''}
                  </Tag>
                </div>
                <Title level={4} style={{ margin: '0 0 2px' }}>{detail.companyName}</Title>
                <Text style={{ fontSize: 15, color: '#555' }}>{detail.positionName}</Text>
              </div>

              {/* Info grid */}
              <Row gutter={[16, 12]}>
                {[
                  ['行业', detail.industry],
                  ['规模', detail.company?.scale],
                  ['Base地', detail.location],
                  ['公司城市', detail.company?.city],
                  ['薪酬', (detail.salaryMin || detail.salaryMax) ? `${detail.salaryMin || '?'}K - ${detail.salaryMax || '?'}K` : null],
                  ['投递渠道', detail.source],
                  ['投递日期', detail.appliedDate ? dayjs(detail.appliedDate).format('YYYY-MM-DD') : null],
                  ['投递天数', daysAgo(detail.appliedDate)],
                  ['简历版本', detail.resumeVersion],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <Col span={12} key={label}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{label}</Text>
                    {label === '公司网站' ? (
                      <a href={val as string} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{val}</a>
                    ) : (
                      <Text style={{ fontSize: 13 }}>{val}</Text>
                    )}
                  </Col>
                ))}
                {detail.company?.website && (
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>公司网站</Text>
                    <a href={detail.company.website} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{detail.company.website}</a>
                  </Col>
                )}
              </Row>

              {/* JD */}
              {(detail.jdLink || detail.jdText) && (
                <div style={{ marginTop: 18, padding: '14px 16px', background: '#fafafa', borderRadius: 12 }}>
                  <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>JD 信息</Text>
                  {detail.jdLink && (
                    <div style={{ marginBottom: 6 }}>
                      <a href={detail.jdLink} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}><LinkOutlined /> 查看 JD 原文</a>
                    </div>
                  )}
                  {detail.jdText && <Paragraph style={{ fontSize: 13, color: '#666', margin: 0, whiteSpace: 'pre-wrap' }}>{detail.jdText}</Paragraph>}
                </div>
              )}

              {/* Notes */}
              {detail.notes && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>备注</Text>
                  <Paragraph style={{ fontSize: 13, color: '#666', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{detail.notes}</Paragraph>
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                <Button icon={<EditOutlined />} style={{ borderRadius: 10 }} onClick={() => { openEdit(detail); setDetail(null); }}>编辑</Button>
                {detail.currentStage === '未投递' && (
                  <Button type="primary" ghost icon={<SendOutlined />} style={{ borderRadius: 10 }} onClick={() => { openApply(detail); setDetail(null); }}>确认投递</Button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal title="编辑投递记录" open={editOpen} onOk={handleSave} onCancel={() => setEditOpen(false)}
        confirmLoading={editLoading} width={640} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#8b7cf0' }}>公司信息</Text>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="companyName" label="公司名称" rules={[{ required: true }]}><Input placeholder="如：字节跳动" /></Form.Item></Col>
            <Col span={12}><Form.Item name="companyScale" label="规模"><Select allowClear placeholder="选填" options={['初创(1-50)', '小型(50-200)', '中型(200-1000)', '大型(1000-10000)', '巨头(10000+)'].map((s) => ({ label: s, value: s }))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="companyCity" label="公司城市"><Input placeholder="如：北京" /></Form.Item></Col>
            <Col span={8}><Form.Item name="companyWebsite" label="公司网站"><Input placeholder="https://" /></Form.Item></Col>
            <Col span={8}><Form.Item name="industry" label="行业"><Input placeholder="互联网/金融" /></Form.Item></Col>
          </Row>

          <Text strong style={{ display: 'block', margin: '12px 0 8px', fontSize: 13, color: '#fa8c16' }}>岗位信息</Text>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="positionName" label="岗位名称" rules={[{ required: true }]}><Input placeholder="如：高级前端工程师" /></Form.Item></Col>
            <Col span={8}><Form.Item name="location" label="Base地"><Input placeholder="城市" /></Form.Item></Col>
            <Col span={8}><Form.Item name="source" label="投递渠道"><Select allowClear placeholder="选填" options={SOURCES.map((s) => ({ label: s, value: s }))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="salaryMin" label="薪资下限(K)"><InputNumber style={{ width: '100%' }} placeholder="40" /></Form.Item></Col>
            <Col span={8}><Form.Item name="salaryMax" label="薪资上限(K)"><InputNumber style={{ width: '100%' }} placeholder="60" /></Form.Item></Col>
            <Col span={8}><Form.Item name="appliedDate" label="投递日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="resumeVersion" label="使用简历版本"><Input placeholder="如：通用版 / 前端专家版" /></Form.Item>

          <Text strong style={{ display: 'block', margin: '12px 0 8px', fontSize: 13, color: '#52c41a' }}>JD 与备注</Text>
          <Form.Item name="jdLink" label="JD 链接"><Input prefix={<LinkOutlined />} placeholder="https://..." /></Form.Item>
          <Form.Item name="jdText" label="JD 摘要"><TextArea rows={3} placeholder="粘贴 JD 关键信息..." /></Form.Item>
          <Form.Item name="notes" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* ── Apply Modal ── */}
      <Modal title={applyApp ? `确认投递 — ${applyApp.companyName} ${applyApp.positionName}` : '确认投递'}
        open={applyOpen} onOk={handleApply} onCancel={() => { setApplyOpen(false); setApplyApp(null); }}
        confirmLoading={applyLoading} okText="确认投递" cancelText="取消">
        <Form form={applyForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="source" label="投递渠道"><Select placeholder="选择" options={SOURCES.map((s) => ({ label: s, value: s }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Base地"><Input placeholder="城市" /></Form.Item></Col>
          </Row>
          <Form.Item name="appliedDate" label="投递日期" rules={[{ required: true, message: '必填' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="resumeVersion" label="简历版本"><Input placeholder="通用版 / 前端专家版" /></Form.Item>
          <Form.Item name="jdText" label="JD 摘要"><TextArea rows={2} placeholder="简单记一下 JD 关键要求..." /></Form.Item>
        </Form>
      </Modal>

      {/* ── End Modal ── */}
      <Modal title={endApp ? `结束 — ${endApp.companyName} ${endApp.positionName}` : '结束'}
        open={endOpen} onOk={handleEnd} onCancel={() => { setEndOpen(false); setEndApp(null); }}
        okText="确认" cancelText="取消" okButtonProps={{ disabled: !endReason }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {END_REASONS.map((r) => (
            <Tag key={r} style={{ cursor: 'pointer', borderRadius: 12, padding: '4px 14px', fontSize: 13, background: endReason === r ? '#8b7cf0' : '#f5f5f5', color: endReason === r ? '#fff' : '#333', border: 'none' }}
              onClick={() => setEndReason(r)}>{r}</Tag>
          ))}
        </div>
      </Modal>
    </div>
  );
}
