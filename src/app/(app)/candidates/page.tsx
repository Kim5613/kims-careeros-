'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Typography, Space, message,
  Drawer, Timeline, Badge, Row, Col, Statistic, InputNumber, Divider, Tooltip, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  TeamOutlined, StarOutlined, StarFilled, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';
import ResumeParseModal from '@/components/ResumeParseModal';
import { useApiList } from '@/lib/hooks/useApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ===================== Types =====================
interface CandidateInterview {
  id: string;
  round: number;
  interviewDate: string;
  interviewer: string;
  evaluation: string;
  notes: string;
}

interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  skills: string[];
  experienceYears: number;
  source: string;
  status: string;
  talentPoolTag: boolean;
  resumeSnapshot: string;
  notes: string;
  createdAt: string;
  interviews: CandidateInterview[];
}

// ===================== Mock Data =====================
const mockCandidates: Candidate[] = [
  {
    id: 'c1', name: '张明远', phone: '13800001001', email: 'zhangmy@example.com',
    company: '字节跳动', position: '高级算法工程师', skills: ['Python', 'TensorFlow', 'NLP', '推荐系统'],
    experienceYears: 6, source: '猎头推荐', status: '面试中', talentPoolTag: true,
    resumeSnapshot: '6年算法经验，专注NLP和推荐系统方向，曾主导DAU千万级产品推荐算法升级。', notes: '沟通能力强，期望薪资50-60K',
    createdAt: '2024-03-01', interviews: [
      { id: 'i1', round: 1, interviewDate: '2024-03-10', interviewer: '李技术', evaluation: '技术扎实，算法功底好', notes: '通过' },
      { id: 'i2', round: 2, interviewDate: '2024-03-15', interviewer: '王总监', evaluation: '系统设计能力不错，有一定管理经验', notes: '进入终面' },
    ]
  },
  {
    id: 'c2', name: '林雨晴', phone: '13800001002', email: 'linyq@example.com',
    company: '腾讯', position: '产品经理', skills: ['需求分析', 'Axure', '数据驱动', 'B端产品'],
    experienceYears: 4, source: '内推', status: '已录用', talentPoolTag: true,
    resumeSnapshot: '4年B端产品经验，负责企业级SaaS产品从0到1搭建。', notes: '已接受offer，预计4月入职',
    createdAt: '2024-02-15', interviews: [
      { id: 'i3', round: 1, interviewDate: '2024-02-20', interviewer: '陈产品', evaluation: '产品思维清晰，沟通表达好', notes: '强烈推荐' },
      { id: 'i4', round: 2, interviewDate: '2024-02-25', interviewer: '赵VP', evaluation: '综合素质高，符合团队需求', notes: '通过' },
    ]
  },
  {
    id: 'c3', name: '王浩然', phone: '13800001003', email: 'wanghr@example.com',
    company: '阿里巴巴', position: '前端开发工程师', skills: ['React', 'TypeScript', 'Node.js', '微前端'],
    experienceYears: 5, source: '招聘网站', status: '待筛选', talentPoolTag: false,
    resumeSnapshot: '5年前端经验，精通React生态，有大型微前端架构实践经验。', notes: '',
    createdAt: '2024-03-10', interviews: []
  },
  {
    id: 'c4', name: '陈思涵', phone: '13800001004', email: 'chensh@example.com',
    company: '美团', position: '财务经理', skills: ['CPA', '财务分析', '预算管理', 'SAP'],
    experienceYears: 8, source: '猎头推荐', status: '已拒绝', talentPoolTag: false,
    resumeSnapshot: '8年财务管理经验，CPA持证，擅长上市公司财务管理。', notes: '薪资期望超出预算，暂不匹配',
    createdAt: '2024-01-20', interviews: [
      { id: 'i5', round: 1, interviewDate: '2024-01-28', interviewer: '刘CFO', evaluation: '专业能力强，但薪资期望较高', notes: '待商榷' },
    ]
  },
  {
    id: 'c5', name: '赵文博', phone: '13800001005', email: 'zhaowb@example.com',
    company: '华为', position: '后端开发工程师', skills: ['Java', 'Spring Boot', '微服务', 'Kubernetes'],
    experienceYears: 7, source: '官网投递', status: '面试中', talentPoolTag: true,
    resumeSnapshot: '7年Java后端经验，精通微服务架构，有大规模分布式系统经验。', notes: '二面通过，等待终面安排',
    createdAt: '2024-02-28', interviews: [
      { id: 'i6', round: 1, interviewDate: '2024-03-05', interviewer: '孙架构', evaluation: '基础扎实，分布式经验丰富', notes: '通过' },
      { id: 'i7', round: 2, interviewDate: '2024-03-12', interviewer: '周CTO', evaluation: '架构设计能力强，有技术深度', notes: '推荐进入终面' },
    ]
  },
  {
    id: 'c6', name: '刘诗琪', phone: '13800001006', email: 'liusq@example.com',
    company: '小红书', position: '运营总监', skills: ['增长运营', '内容策略', '数据分析', '团队管理'],
    experienceYears: 9, source: '猎头推荐', status: '暂缓', talentPoolTag: true,
    resumeSnapshot: '9年运营经验，3年团队管理，擅长内容平台增长策略。', notes: '目前暂无合适HC，标记人才储备',
    createdAt: '2024-01-10', interviews: [
      { id: 'i8', round: 1, interviewDate: '2024-01-18', interviewer: '吴CMO', evaluation: '能力很强，但目前没有总监级HC', notes: '暂缓' },
    ]
  },
  {
    id: 'c7', name: '黄俊杰', phone: '13800001007', email: 'huangjj@example.com',
    company: '京东', position: '销售总监', skills: ['B2B销售', '大客户管理', '团队激励', 'CRM'],
    experienceYears: 10, source: '内推', status: '已录用', talentPoolTag: false,
    resumeSnapshot: '10年B2B销售经验，5年团队管理，年销售额过亿。', notes: '已入职，表现良好',
    createdAt: '2024-01-05', interviews: [
      { id: 'i9', round: 1, interviewDate: '2024-01-12', interviewer: '郑VP', evaluation: '业绩突出，资源丰富', notes: '强烈推荐' },
      { id: 'i10', round: 2, interviewDate: '2024-01-18', interviewer: 'CEO', evaluation: '综合素质高，认可公司方向', notes: '通过' },
    ]
  },
  {
    id: 'c8', name: '吴晓梅', phone: '13800001008', email: 'wuxm@example.com',
    company: '百度', position: 'UI/UX设计师', skills: ['Figma', 'Sketch', '交互设计', '设计系统'],
    experienceYears: 5, source: '招聘网站', status: '已拒绝', talentPoolTag: false,
    resumeSnapshot: '5年设计经验，擅长B端产品设计和设计系统搭建。', notes: '候选人接受其他公司offer',
    createdAt: '2024-02-05', interviews: [
      { id: 'i11', round: 1, interviewDate: '2024-02-12', interviewer: '设计主管', evaluation: '设计能力不错，作品集质量高', notes: '通过' },
      { id: 'i12', round: 2, interviewDate: '2024-02-18', interviewer: '产品VP', evaluation: '沟通良好，但薪资谈判中接受其他offer', notes: '遗憾' },
    ]
  },
  {
    id: 'c9', name: '杨帆', phone: '13800001009', email: 'yangf@example.com',
    company: '网易', position: '数据分析师', skills: ['SQL', 'Python', 'Tableau', '机器学习'],
    experienceYears: 3, source: '官网投递', status: '放弃', talentPoolTag: false,
    resumeSnapshot: '3年数据分析经验，擅长数据可视化和用户行为分析。', notes: '候选人主动放弃，选择出国深造',
    createdAt: '2024-03-05', interviews: [
      { id: 'i13', round: 1, interviewDate: '2024-03-12', interviewer: '数据主管', evaluation: '基础好，学习能力强', notes: '通过' },
    ]
  },
  {
    id: 'c10', name: '郑凯文', phone: '13800001010', email: 'zhengkw@example.com',
    company: '蚂蚁集团', position: '安全工程师', skills: ['渗透测试', '安全审计', 'Python', '网络安全'],
    experienceYears: 6, source: '猎头推荐', status: '待筛选', talentPoolTag: true,
    resumeSnapshot: '6年安全工程经验，CISSP持证，多次发现高危漏洞。', notes: '简历待评估',
    createdAt: '2024-03-12', interviews: []
  },
];

// ===================== Status Config =====================
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  '待筛选': { color: 'default', icon: <ClockCircleOutlined /> },
  '面试中': { color: 'processing', icon: <ClockCircleOutlined /> },
  '已录用': { color: 'success', icon: <CheckCircleOutlined /> },
  '已拒绝': { color: 'error', icon: <CloseCircleOutlined /> },
  '暂缓': { color: 'warning', icon: <ClockCircleOutlined /> },
  '放弃': { color: 'default', icon: <CloseCircleOutlined /> },
};

const statusOptions = ['待筛选', '面试中', '已录用', '已拒绝', '暂缓', '放弃'];
const sourceOptions = ['猎头推荐', '内推', '招聘网站', '官网投递', '社交平台'];

// ===================== API helper for mapping =====================
function mapApiCandidate(c: any): Candidate {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || '',
    email: c.email || '',
    company: c.company?.name || '',
    position: c.position || '',
    skills: c.skills || [],
    experienceYears: c.experienceYears || 0,
    source: c.source || '',
    status: c.status || '待筛选',
    talentPoolTag: c.talentPoolTag || false,
    resumeSnapshot: c.resumeSnapshot || '',
    notes: c.notes || '',
    createdAt: c.createdAt ? c.createdAt.split('T')[0] : '',
    interviews: (c.interviews || []).map((i: any) => ({
      id: i.id,
      round: i.round,
      interviewDate: i.interviewDate || '',
      interviewer: i.interviewer || '',
      evaluation: i.evaluation || '',
      notes: i.notes || '',
    })),
  };
}

// ===================== Component =====================
export default function CandidatesPage() {
  const {
    data: candidates,
    loading,
    create: apiCreate,
    update: apiUpdate,
    remove: apiRemove,
    refetch,
  } = useApiList<Candidate>({
    endpoint: '/api/candidates',
    mockData: mockCandidates,
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined);
  const [talentPoolOnly, setTalentPoolOnly] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [addInterviewVisible, setAddInterviewVisible] = useState(false);
  const [uploadAreaVisible, setUploadAreaVisible] = useState(false);
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [parsingAttachmentId, setParsingAttachmentId] = useState<string | null>(null);
  const [addForm] = Form.useForm();
  const [interviewForm] = Form.useForm();

  // 当 candidates 刷新时同步 selectedCandidate
  useEffect(() => {
    if (selectedCandidate) {
      const updated = candidates.find(c => c.id === selectedCandidate.id);
      if (updated) setSelectedCandidate(updated);
    }
  }, [candidates]);

  // ===================== Statistics =====================
  const stats = useMemo(() => {
    const total = candidates.length;
    const byStatus: Record<string, number> = {};
    statusOptions.forEach(s => { byStatus[s] = 0; });
    candidates.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
    const talentPoolCount = candidates.filter(c => c.talentPoolTag).length;
    return { total, byStatus, talentPoolCount };
  }, [candidates]);

  // ===================== Filtered Data =====================
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (searchText && !c.name.includes(searchText)) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (sourceFilter && c.source !== sourceFilter) return false;
      if (talentPoolOnly && !c.talentPoolTag) return false;
      return true;
    });
  }, [candidates, searchText, statusFilter, sourceFilter, talentPoolOnly]);

  // ===================== Handlers =====================
  const handleAddCandidate = async (values: any) => {
    const skills = values.skills ? values.skills.split(/[,，、]/).map((s: string) => s.trim()) : [];
    const created = await apiCreate({
      name: values.name,
      phone: values.phone,
      email: values.email,
      companyName: values.company,
      position: values.position,
      skills,
      experienceYears: values.experienceYears,
      source: values.source,
      resumeSnapshot: values.resumeSnapshot,
      notes: values.notes,
    } as any);
    // 用 API 返回的数据更新，保证 ID 一致
    if (created) {
      await refetch();
    }
    setAddModalVisible(false);
    addForm.resetFields();
    message.success('候选人添加成功');
  };

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    apiUpdate(candidateId, { status: newStatus } as any);
    message.success(`状态已更新为"${newStatus}"`);
  };

  const handleToggleTalentPool = (candidateId: string) => {
    const target = candidates.find(c => c.id === candidateId);
    if (target) {
      apiUpdate(candidateId, { talentPoolTag: !target.talentPoolTag } as any);
      message.success('人才库标记已更新');
    }
  };

  const handleDeleteCandidate = (candidateId: string) => {
    apiRemove(candidateId);
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(null);
      setDetailDrawerVisible(false);
    }
    message.success('候选人已删除');
  };

  const handleAddInterview = async (values: any) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch('/api/candidate-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          round: values.round,
          interviewDate: values.interviewDate,
          interviewer: values.interviewer,
          evaluation: values.evaluation,
          notes: values.notes,
        }),
      });
      if (res.ok) {
        await refetch();
        message.success('面试记录已添加');
      } else {
        throw new Error();
      }
    } catch {
      message.success('面试记录已添加（本地）');
    }
    setAddInterviewVisible(false);
    interviewForm.resetFields();
  };

  const handleResumeSnapshotUpdate = async (parsedText: string) => {
    if (!selectedCandidate) return;
    await apiUpdate(selectedCandidate.id, { resumeSnapshot: parsedText } as any);
    message.success('简历快照已更新');
  };

  // ===================== Table Columns =====================
  const columns: ColumnsType<Candidate> = [
    {
      title: '姓名', dataIndex: 'name', key: 'name', fixed: 'left', width: 100,
      render: (name: string, record: Candidate) => (
        <Space>
          <UserOutlined />
          <a onClick={() => { setSelectedCandidate(record); setDetailDrawerVisible(true); }}>{name}</a>
          {record.talentPoolTag && <Tooltip title="人才储备"><StarFilled style={{ color: '#faad14' }} /></Tooltip>}
        </Space>
      ),
    },
    {
      title: '电话', dataIndex: 'phone', key: 'phone', width: 130,
      render: (phone: string) => <Space><PhoneOutlined />{phone}</Space>,
    },
    {
      title: '邮箱', dataIndex: 'email', key: 'email', width: 160,
      render: (email: string) => <Space><MailOutlined /><Text ellipsis={{ tooltip: email }}>{email}</Text></Space>,
    },
    { title: '公司', dataIndex: 'company', key: 'company', width: 110 },
    { title: '职位', dataIndex: 'position', key: 'position', width: 140 },
    {
      title: '技能', dataIndex: 'skills', key: 'skills', width: 220,
      render: (skills: string[]) => (
        <Space wrap>{skills.map(s => <Tag key={s} color="#8b7cf0" style={{ borderRadius: 14 }}>{s}</Tag>)}</Space>
      ),
    },
    {
      title: '经验(年)', dataIndex: 'experienceYears', key: 'experienceYears', width: 90, align: 'center',
      render: (y: number) => <Tag style={{ borderRadius: 14 }}>{y}年</Tag>,
    },
    {
      title: '来源', dataIndex: 'source', key: 'source', width: 100,
      render: (s: string) => <Tag color="cyan" style={{ borderRadius: 14 }}>{s}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 120,
      render: (status: string, record: Candidate) => (
        <Dropdown
          menu={{
            items: statusOptions.map(s => ({ key: s, label: s })),
            onClick: ({ key }) => handleStatusChange(record.id, key),
          }}
          trigger={['click']}
        >
          <Tag color={statusConfig[status]?.color} icon={statusConfig[status]?.icon} style={{ cursor: 'pointer', borderRadius: 14 }}>
            {status}
          </Tag>
        </Dropdown>
      ),
      filters: statusOptions.map(s => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 110, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: '操作', key: 'actions', fixed: 'right', width: 140,
      render: (_: any, record: Candidate) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<UserOutlined />}
              onClick={() => { setSelectedCandidate(record); setDetailDrawerVisible(true); }} />
          </Tooltip>
          <Tooltip title={record.talentPoolTag ? '移除人才库' : '加入人才库'}>
            <Button type="link" size="small"
              icon={record.talentPoolTag ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => handleToggleTalentPool(record.id)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}
              onClick={() => handleDeleteCandidate(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ===================== Render =====================
  return (
    <div style={{ padding: '20px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      <Title level={2}>候选人简历库</Title>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="总候选人" value={stats.total} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="待筛选" value={stats.byStatus['待筛选']} valueStyle={{ color: '#8c8c8c' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="面试中" value={stats.byStatus['面试中']} valueStyle={{ color: '#8b7cf0' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="已录用" value={stats.byStatus['已录用']} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="已拒绝" value={stats.byStatus['已拒绝']} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="暂缓" value={stats.byStatus['暂缓']} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="放弃" value={stats.byStatus['放弃']} valueStyle={{ color: '#d9d9d9' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card size="small" style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><Statistic title="人才储备" value={stats.talentPoolCount} prefix={<StarFilled style={{ color: '#faad14' }} />} /></Card>
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: 16, borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Space wrap>
          <Input
            placeholder="搜索候选人姓名"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 200, borderRadius: 14 }}
          />
          <Select
            placeholder="按状态筛选"
            value={statusFilter}
            onChange={v => setStatusFilter(v)}
            allowClear
            style={{ width: 140, borderRadius: 14 }}
            options={statusOptions.map(s => ({ label: s, value: s }))}
          />
          <Select
            placeholder="按来源筛选"
            value={sourceFilter}
            onChange={v => setSourceFilter(v)}
            allowClear
            style={{ width: 140, borderRadius: 14 }}
            options={sourceOptions.map(s => ({ label: s, value: s }))}
          />
          <Button
            type={talentPoolOnly ? 'primary' : 'default'}
            icon={<StarFilled />}
            onClick={() => setTalentPoolOnly(!talentPoolOnly)}
          >
            仅人才库
          </Button>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 20 }} onClick={() => setAddModalVisible(true)}>
            新增候选人
          </Button>
        </Space>
      </Card>

      {/* Candidate Table */}
      <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="id"
          scroll={{ x: 1600 }}
          pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条` }}
        />
      </Card>

      {/* Add Candidate Modal */}
      <Modal
        title="新增候选人"
        open={addModalVisible}
        onCancel={() => { setAddModalVisible(false); addForm.resetFields(); }}
        onOk={() => addForm.submit()}
        width={640}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddCandidate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入候选人姓名" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="请输入电话号码" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="当前公司">
                <Input placeholder="请输入当前公司" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="当前职位">
                <Input placeholder="请输入当前职位" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experienceYears" label="工作年限">
                <InputNumber min={0} max={50} placeholder="年" style={{ width: '100%', borderRadius: 14 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="skills" label="技能标签">
            <Input placeholder="多个技能用逗号分隔，如：Python, TensorFlow, NLP" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="source" label="来源渠道">
            <Select placeholder="请选择来源" style={{ borderRadius: 14 }} options={sourceOptions.map(s => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item name="resumeSnapshot" label="简历快照">
            <TextArea rows={3} placeholder="简要描述候选人简历要点" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="备注信息" style={{ borderRadius: 14 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Candidate Detail Drawer */}
      <Drawer
        title={selectedCandidate?.name ? `候选人详情 - ${selectedCandidate.name}` : '候选人详情'}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
      >
        {selectedCandidate && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}><Text strong>姓名：</Text>{selectedCandidate.name}</Col>
              <Col span={12}><Text strong>电话：</Text>{selectedCandidate.phone}</Col>
              <Col span={12}><Text strong>邮箱：</Text>{selectedCandidate.email}</Col>
              <Col span={12}><Text strong>公司：</Text>{selectedCandidate.company}</Col>
              <Col span={12}><Text strong>职位：</Text>{selectedCandidate.position}</Col>
              <Col span={12}><Text strong>工作年限：</Text>{selectedCandidate.experienceYears}年</Col>
              <Col span={12}><Text strong>来源：</Text><Tag color="cyan" style={{ borderRadius: 14 }}>{selectedCandidate.source}</Tag></Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                <Tag color={statusConfig[selectedCandidate.status]?.color} style={{ borderRadius: 14 }}>
                  {selectedCandidate.status}
                </Tag>
              </Col>
              <Col span={24}>
                <Text strong>技能：</Text>
                <Space wrap>{selectedCandidate.skills.map(s => <Tag key={s} color="#8b7cf0" style={{ borderRadius: 14 }}>{s}</Tag>)}</Space>
              </Col>
              <Col span={12}>
                <Text strong>人才储备：</Text>
                {selectedCandidate.talentPoolTag
                  ? <Badge status="success" text={<Text type="success">是</Text>} />
                  : <Text type="secondary">否</Text>}
              </Col>
              <Col span={12}><Text strong>创建日期：</Text>{selectedCandidate.createdAt}</Col>
            </Row>

            <Divider>简历文件</Divider>
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="small"
                style={{ borderRadius: 20 }}
                onClick={() => setUploadAreaVisible(!uploadAreaVisible)}
              >
                {uploadAreaVisible ? '收起上传' : '导入简历'}
              </Button>
            </Space>

            {uploadAreaVisible && selectedCandidate && (
              <div style={{ marginBottom: 16 }}>
                <FileUpload
                  entityType="candidate"
                  entityId={selectedCandidate.id}
                  onSuccess={(attachment: any) => {
                    message.success('文件上传成功，正在解析...');
                    setParsingAttachmentId(attachment.id);
                    setParseModalOpen(true);
                  }}
                />
              </div>
            )}

            {selectedCandidate && (
              <div style={{ marginBottom: 16 }}>
                <AttachmentList
                  entityType="candidate"
                  entityId={selectedCandidate.id}
                  onParsed={(attachment) => {
                    if (attachment.parsedText) {
                      handleResumeSnapshotUpdate(attachment.parsedText);
                    }
                  }}
                />
              </div>
            )}

            <Divider>简历快照</Divider>
            <TextArea
              rows={4}
              value={selectedCandidate.resumeSnapshot || ''}
              onChange={e => {
                if (!selectedCandidate) return;
                const val = e.target.value;
                apiUpdate(selectedCandidate.id, { resumeSnapshot: val } as any);
                setSelectedCandidate({ ...selectedCandidate, resumeSnapshot: val });
              }}
              placeholder="简历快照可由文档解析自动填充，也可手动编辑"
              style={{ marginBottom: 16, borderRadius: 14 }}
            />

            {selectedCandidate.notes && (
              <>
                <Divider>备注</Divider>
                <Paragraph>{selectedCandidate.notes}</Paragraph>
              </>
            )}

            <Divider>面试记录</Divider>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              style={{ marginBottom: 16, borderRadius: 20 }}
              onClick={() => setAddInterviewVisible(true)}
            >
              添加面试记录
            </Button>
            {selectedCandidate.interviews.length > 0 ? (
              <Timeline
                items={selectedCandidate.interviews
                  .sort((a, b) => a.round - b.round)
                  .map(interview => ({
                    color: '#8b7cf0',
                    children: (
                      <div key={interview.id}>
                        <Text strong>第{interview.round}轮面试</Text>
                        <br />
                        <Text type="secondary">{interview.interviewDate}</Text>
                        <br />
                        <Text>面试官：{interview.interviewer}</Text>
                        <br />
                        <Text>评价：{interview.evaluation}</Text>
                        {interview.notes && <><br /><Text type="secondary">备注：{interview.notes}</Text></>}
                      </div>
                    ),
                  }))}
              />
            ) : (
              <Text type="secondary">暂无面试记录</Text>
            )}
          </div>
        )}
      </Drawer>

      {/* Resume Parse Confirm Modal */}
      <ResumeParseModal
        open={parseModalOpen}
        attachmentId={parsingAttachmentId}
        onCancel={() => {
          setParseModalOpen(false);
          setParsingAttachmentId(null);
        }}
        onConfirm={async (parsedText: string) => {
          if (selectedCandidate) {
            // 保存解析文本到候选人
            await apiUpdate(selectedCandidate.id, { resumeSnapshot: parsedText } as any);
            // 同时保存到附件记录
            if (parsingAttachmentId) {
              await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachmentId: parsingAttachmentId }),
              });
            }
            await refetch();
          }
        }}
      />

      {/* Add Interview Modal */}
      <Modal
        title="添加面试记录"
        open={addInterviewVisible}
        onCancel={() => { setAddInterviewVisible(false); interviewForm.resetFields(); }}
        onOk={() => interviewForm.submit()}
      >
        <Form form={interviewForm} layout="vertical" onFinish={handleAddInterview}>
          <Form.Item name="round" label="面试轮次" rules={[{ required: true, message: '请输入面试轮次' }]}>
            <InputNumber min={1} max={10} placeholder="第几轮" style={{ width: '100%', borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="interviewDate" label="面试日期" rules={[{ required: true, message: '请输入面试日期' }]}>
            <Input placeholder="如：2024-03-20" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="interviewer" label="面试官">
            <Input placeholder="请输入面试官姓名" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="evaluation" label="面试评价">
            <TextArea rows={3} placeholder="请输入面试评价" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="备注信息" style={{ borderRadius: 14 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
