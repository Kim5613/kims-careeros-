'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import { Button, Tag, Typography, Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STAGE_TREE: Record<string, string[] | null> = {
  '已投递': null, '面试': ['已沟通', '一面', '二面', '三面', '终面'],
  'offer': ['已谈薪', '接offer', '拒offer'], '已结束': null,
};
const MAIN_STAGES = Object.keys(STAGE_TREE);
const INTERVIEW_TYPES = ['电话', '视频', '现场'];
const INTERVIEW_ROUNDS = ['已沟通', '一面', '二面', '三面', '终面'];

const COLUMN_CONFIG: Record<string, { color: string; bg: string }> = {
  '已投递': { color: '#8b7cf0', bg: '#faf8fd' },
  '面试': { color: '#e09840', bg: '#fdfaf6' },
  'offer': { color: '#5ba85a', bg: '#f8fcf7' },
  '已结束': { color: '#999', bg: '#faf8f6' },
};

interface InterviewRecord {
  id?: string; round: string; interviewDate: string; interviewType: string;
  interviewer: string; position: string; title: string; content: string; result: string;
  reviewNotes?: string;
}
interface JobApplication {
  id: string; companyName: string; industry: string; positionName: string;
  salaryMin: number | null; salaryMax: number | null;
  currentStage: string; stageDetail: string | null;
  source: string | null; appliedDate: string | null; notes: string | null;
  createdAt: string; interviews: InterviewRecord[];
  company?: { name: string };
}

function mapApp(item: any): JobApplication {
  return {
    id: item.id, companyName: item.company?.name || item.companyName || '',
    industry: item.industry || '', positionName: item.positionName || '',
    salaryMin: item.salaryMin ?? null, salaryMax: item.salaryMax ?? null,
    currentStage: item.currentStage || '已投递', stageDetail: item.stageDetail || null,
    source: item.source || null, appliedDate: item.appliedDate || null,
    notes: item.notes || null, createdAt: item.createdAt || '',
    interviews: (item.interviews || []).map((iv: any) => ({
      round: iv.round || '', interviewDate: iv.interviewDate || '', interviewType: iv.interviewType || '现场',
      interviewer: iv.interviewer || '', position: iv.position || '',
      title: iv.title || '', content: iv.content || '', result: iv.result || '',
      reviewNotes: iv.reviewNotes || '',
    })),
  };
}

const MOCK_APPLICATIONS: JobApplication[] = [
  { id: 'm1', companyName: '字节跳动', industry: '互联网', positionName: '高级前端', salaryMin: 40000, salaryMax: 60000, currentStage: '面试', stageDetail: '二面', source: '内推', appliedDate: '2026-05-10', notes: null, createdAt: '2026-05-10', interviews: [{ round: '一面', interviewDate: '2026-05-15 14:00', interviewType: '视频', interviewer: '李技术', position: '前端架构师', title: '技术总监', content: '项目经验和架构能力', result: '通过' }] },
  { id: 'm2', companyName: '阿里巴巴', industry: '互联网', positionName: '前端专家', salaryMin: 50000, salaryMax: 70000, currentStage: '已投递', stageDetail: null, source: '猎头', appliedDate: '2026-05-15', notes: null, createdAt: '2026-05-15', interviews: [] },
];

export default function JobSeekingPage() {
  const { data: apps, create: apiCreate, update: apiUpdate, remove: apiRemove } = useApiList<JobApplication>({ endpoint: '/api/applications', mockData: MOCK_APPLICATIONS });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [viewApp, setViewApp] = useState<JobApplication | null>(null);
  const [form] = Form.useForm();
  const [interviewForm] = Form.useForm();
  const [mainStage, setMainStage] = useState<string>('已投递');
  const [editingIvId, setEditingIvId] = useState<string | null>(null);
  const [showIvForm, setShowIvForm] = useState(false);

  const mapped = useMemo(() => apps.map(mapApp), [apps]);
  const filtered = useMemo(() => mapped.filter((a) => !search || a.companyName.includes(search) || a.positionName.includes(search)), [mapped, search]);

  const openNew = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ currentStage: '已投递' }); setMainStage('已投递'); setModalOpen(true); };
  const openEdit = (a: JobApplication) => { setEditing(a); form.setFieldsValue({ companyName: a.companyName, industry: a.industry, positionName: a.positionName, salaryMin: a.salaryMin, salaryMax: a.salaryMax, currentStage: a.currentStage, stageDetail: a.stageDetail, source: a.source, appliedDate: a.appliedDate ? dayjs(a.appliedDate) : null, notes: a.notes }); setMainStage(a.currentStage); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields(); setModalLoading(true);
      const payload = { companyName: vals.companyName, industry: vals.industry || '', positionName: vals.positionName, salaryMin: vals.salaryMin, salaryMax: vals.salaryMax, currentStage: vals.currentStage || '已投递', stageDetail: vals.stageDetail || null, source: vals.source, appliedDate: vals.appliedDate ? vals.appliedDate.toISOString() : null, notes: vals.notes };
      if (editing) { await apiUpdate(editing.id, payload as any); message.success('已更新'); }
      else { await apiCreate(payload as any); message.success('已新增'); }
      setModalOpen(false);
    } catch { /* validation */ }
    finally { setModalLoading(false); }
  };

  const columnsForStage = (stage: string) => filtered.filter((a) => a.currentStage === stage);

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Text style={{ fontSize: 11, fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Job Seeking</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, color: '#1a1a1a', letterSpacing: '-0.02em' }}>求职看板</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input prefix={<SearchOutlined />} placeholder="搜索公司或职位" value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 240, borderRadius: 10 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew} style={{ borderRadius: 10 }}>新增</Button>
          </div>
        </div>
      </div>

      {/* 看板四列 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {MAIN_STAGES.map((stage) => {
          const config = COLUMN_CONFIG[stage] || { color: '#999', bg: '#fafafa' };
          const items = columnsForStage(stage);
          return (
            <div key={stage} style={{
              background: config.bg, borderRadius: 8, padding: 16, minHeight: 420,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 3, background: config.color }} />
                  <Text strong style={{ fontSize: 14, color: '#444' }}>{stage}</Text>
                </div>
                <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#ddd', fontSize: 13 }}>暂无</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setViewApp(app)}
                      style={{
                        cursor: 'pointer', padding: '12px 14px', borderRadius: 10,
                        background: '#fff',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                        borderLeft: `3px solid ${config.color}`,
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ fontSize: 13 }}>{app.companyName}</Text>
                          <Text style={{ fontSize: 12, color: '#888', display: 'block', marginTop: 2 }}>
                            {app.positionName}
                            {(app.salaryMin || app.salaryMax) && <span> · {app.salaryMin ? `${(app.salaryMin/1000).toFixed(0)}K` : '?'}-{app.salaryMax ? `${(app.salaryMax/1000).toFixed(0)}K` : '?'}</span>}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', gap: 1 }}>
                          <Button type="text" size="small" icon={<EditOutlined style={{fontSize:11}}/>} onClick={(e) => { e.stopPropagation(); openEdit(app); }} />
                          <Popconfirm title="删除？" onConfirm={(e) => { e?.stopPropagation(); apiRemove(app.id); message.success('已删除'); }} okText="删" cancelText="否">
                            <Button type="text" size="small" danger icon={<DeleteOutlined style={{fontSize:11}}/>} onClick={(e) => e.stopPropagation()} />
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Modal (unchanged) ── */}
      <Modal title={editing ? '编辑记录' : '新增记录'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} confirmLoading={modalLoading} width={640} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" initialValues={{ currentStage: '已投递' }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="companyName" label="公司" rules={[{ required: true }]}><Input placeholder="公司名称" /></Form.Item></Col>
            <Col span={12}><Form.Item name="industry" label="行业"><Input placeholder="如：互联网、金融" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="positionName" label="职位" rules={[{ required: true }]}><Input placeholder="职位名称" /></Form.Item></Col>
            <Col span={6}><Form.Item name="salaryMin" label="薪资下限(K)"><InputNumber min={0} style={{ width: '100%' }} placeholder="40" /></Form.Item></Col>
            <Col span={6}><Form.Item name="salaryMax" label="薪资上限(K)"><InputNumber min={0} style={{ width: '100%' }} placeholder="60" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="currentStage" label="当前节点"><Select options={MAIN_STAGES.map((s) => ({ label: s, value: s }))} onChange={(v) => { setMainStage(v); form.setFieldValue('stageDetail', null); }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="stageDetail" label="子节点"><Select allowClear placeholder="可选" options={(STAGE_TREE[mainStage] || []).map((s) => ({ label: s, value: s }))} disabled={!STAGE_TREE[mainStage]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="source" label="来源"><Select allowClear placeholder="选填" options={['招聘网站', '猎头', '内推', '官网'].map((s) => ({ label: s, value: s }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="appliedDate" label="投递日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="notes" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Modal (unchanged) ── */}
      <Modal title={viewApp ? `${viewApp.companyName} - ${viewApp.positionName}` : '详情'} open={!!viewApp} onCancel={() => { setViewApp(null); setShowIvForm(false); }} footer={null} width={640}>
        {viewApp && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button icon={<EditOutlined />} onClick={() => { openEdit(viewApp); setViewApp(null); }}>编辑</Button>
            </div>
            <Row gutter={[16, 12]}>
              <Col span={8}><Text strong>公司：</Text>{viewApp.companyName}</Col>
              <Col span={8}><Text strong>行业：</Text>{viewApp.industry || '-'}</Col>
              <Col span={8}><Text strong>职位：</Text>{viewApp.positionName}</Col>
              <Col span={8}><Text strong>薪资：</Text>{viewApp.salaryMin ? `${viewApp.salaryMin}K` : '?'} - {viewApp.salaryMax ? `${viewApp.salaryMax}K` : '?'}</Col>
              <Col span={8}><Text strong>节点：</Text><Tag color={COLUMN_CONFIG[viewApp.currentStage]?.color}>{viewApp.currentStage}{viewApp.stageDetail ? `·${viewApp.stageDetail}` : ''}</Tag></Col>
              <Col span={8}><Text strong>投递：</Text>{viewApp.appliedDate || '-'}</Col>
            </Row>

            <div style={{ margin: '20px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 15 }}>面试记录</Text>
              {!showIvForm && (
                <Text type="secondary" style={{ cursor: 'pointer', fontSize: 13 }} onClick={() => { setShowIvForm(true); interviewForm.resetFields(); setEditingIvId(null); }}>添加记录</Text>
              )}
            </div>

            {showIvForm && (
            <Form form={interviewForm} layout="vertical"
              onFinish={async (vals) => {
                try {
                  const body = { applicationId: viewApp.id, interviewDate: vals.interviewDate ? vals.interviewDate.toISOString() : null, interviewType: vals.interviewType, round: vals.round, interviewer: vals.interviewer, position: vals.position, title: vals.title, content: vals.content, result: vals.result, reviewNotes: vals.reviewNotes };
                  if (editingIvId) {
                    await fetch(`/api/interview-records/${editingIvId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                    message.success('已更新');
                  } else {
                    await fetch('/api/interview-records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                    message.success('已添加');
                  }
                  interviewForm.resetFields(); setEditingIvId(null); setShowIvForm(false);
                  const res = await fetch(`/api/applications/${viewApp.id}`);
                  if (res.ok) setViewApp(mapApp(await res.json()));
                } catch { message.error('操作失败'); }
              }}>
              <Row gutter={[12, 0]}>
                <Col span={5}><Form.Item name="round" label="轮次" rules={[{ required: true }]}><Select options={INTERVIEW_ROUNDS.map((r) => ({ label: r, value: r }))} /></Form.Item></Col>
                <Col span={7}><Form.Item name="interviewDate" label="时间" rules={[{ required: true }]}><DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="选择日期时间" /></Form.Item></Col>
                <Col span={4}><Form.Item name="interviewType" label="形式" rules={[{ required: true }]}><Select options={INTERVIEW_TYPES.map((t) => ({ label: t, value: t }))} /></Form.Item></Col>
                <Col span={5}><Form.Item name="result" label="结果"><Select options={[{ label: '通过', value: '通过' }, { label: '不通过', value: '不通过' }, { label: '待反馈', value: '待反馈' }]} /></Form.Item></Col>
              </Row>
              <Row gutter={[12, 0]}>
                <Col span={8}><Form.Item name="interviewer" label="面试官"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="position" label="岗位"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="title" label="Title"><Input /></Form.Item></Col>
              </Row>
              <Form.Item name="content" label="沟通内容"><TextArea rows={2} /></Form.Item>
              <Form.Item name="reviewNotes" label="复盘笔记"><TextArea rows={2} placeholder="面试官风格、关键问题、回答反思、团队判断..." /></Form.Item>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="primary" htmlType="submit">{editingIvId ? '保存' : '添加'}</Button>
                <Button onClick={() => { setShowIvForm(false); interviewForm.resetFields(); setEditingIvId(null); }}>取消</Button>
              </div>
            </Form>
            )}

            {viewApp.interviews.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {viewApp.interviews.map((iv, i) => (
                  <div key={iv.id || i} style={{ marginBottom: 8, padding: '12px 16px', borderRadius: 10, background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Tag color="blue" style={{ margin: 0 }}>{iv.round || '-'}</Tag>
                        <Text style={{ fontSize: 12, color: '#888' }}>{iv.interviewDate}</Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>{iv.interviewType}</Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>{iv.interviewer || '-'}</Text>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Tag color={iv.result === '通过' ? 'green' : iv.result === '不通过' ? 'red' : 'default'} style={{ margin: 0 }}>{iv.result || '-'}</Tag>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => {
                          setShowIvForm(true); setEditingIvId(iv.id || null);
                          interviewForm.setFieldsValue({ interviewDate: iv.interviewDate ? dayjs(iv.interviewDate) : null, interviewType: iv.interviewType, round: iv.round, interviewer: iv.interviewer, position: iv.position, title: iv.title, content: iv.content, result: iv.result, reviewNotes: iv.reviewNotes });
                        }} />
                      </div>
                    </div>
                    {iv.content && <Text style={{ fontSize: 13, color: '#666' }}>{iv.content}</Text>}
                    {iv.reviewNotes && (
                      <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: '#fffbe6' }}>
                        <Text style={{ fontSize: 12, color: '#b8860b' }}>复盘：{iv.reviewNotes}</Text>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}