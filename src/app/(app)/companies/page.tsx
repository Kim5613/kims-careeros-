'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  message,
  Empty,
  Badge,
  Drawer,
  Table,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface CompanyItem {
  id: string;
  name: string;
  industry: string | null;
  scale: string | null;
  city: string | null;
  website: string | null;
  description: string | null;
  applicationCount: number;
  candidateCount: number;
  createdAt: string;
}

interface LinkedApplication {
  id: string;
  positionName: string;
  status: string;
  appliedDate: string | null;
}

interface LinkedCandidate {
  id: string;
  name: string;
  position: string | null;
  status: string;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  '互联网/科技',
  '金融',
  '电商',
  '教育',
  '医疗/健康',
  '游戏',
  '企业服务',
  '通信/硬件',
];

const SCALE_OPTIONS = [
  '0-50人',
  '50-200人',
  '200-500人',
  '500-1000人',
  '1000-5000人',
  '5000-10000人',
  '10000人以上',
];

const CITY_OPTIONS = [
  '北京',
  '上海',
  '深圳',
  '杭州',
  '广州',
  '成都',
  '南京',
  '武汉',
];

const INDUSTRY_COLOR_MAP: Record<string, string> = {
  '互联网/科技': 'blue',
  '金融': 'gold',
  '电商': 'orange',
  '教育': 'green',
  '医疗/健康': 'cyan',
  '游戏': 'purple',
  '企业服务': 'geekblue',
  '通信/硬件': 'red',
};

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_COMPANIES: CompanyItem[] = [
  {
    id: 'company-1',
    name: '字节跳动',
    industry: '互联网/科技',
    scale: '10000人以上',
    city: '北京',
    website: 'https://www.bytedance.com',
    description: '字节跳动是一家全球性的科技公司，旗下产品包括抖音、TikTok、飞书、今日头条等。公司以"激发创造、丰富生活"为使命，致力于通过技术创新连接人与信息。',
    applicationCount: 3,
    candidateCount: 12,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'company-2',
    name: '阿里巴巴',
    industry: '电商',
    scale: '10000人以上',
    city: '杭州',
    website: 'https://www.alibaba.com',
    description: '阿里巴巴集团是全球领先的电子商务和科技公司，业务涵盖电商、云计算、数字媒体、本地生活服务等多个领域。以"让天下没有难做的生意"为愿景。',
    applicationCount: 2,
    candidateCount: 8,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'company-3',
    name: '腾讯',
    industry: '互联网/科技',
    scale: '10000人以上',
    city: '深圳',
    website: 'https://www.tencent.com',
    description: '腾讯是中国最大的互联网综合服务提供商之一，核心业务包括社交、游戏、金融科技、企业服务等。旗下拥有微信、QQ等知名产品。',
    applicationCount: 4,
    candidateCount: 15,
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'company-4',
    name: '美团',
    industry: '电商',
    scale: '10000人以上',
    city: '北京',
    website: 'https://www.meituan.com',
    description: '美团是中国领先的生活服务电子商务平台，提供外卖、到店、酒店旅游、出行等服务。致力于通过科技连接消费者和商家。',
    applicationCount: 2,
    candidateCount: 6,
    createdAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'company-5',
    name: '蚂蚁集团',
    industry: '金融',
    scale: '10000人以上',
    city: '杭州',
    website: 'https://www.antgroup.com',
    description: '蚂蚁集团是全球领先的金融科技公司，旗下拥有支付宝等产品。致力于通过科技创新为全球消费者和小微企业提供普惠金融服务。',
    applicationCount: 1,
    candidateCount: 4,
    createdAt: '2026-03-05T14:00:00.000Z',
  },
  {
    id: 'company-6',
    name: '米哈游',
    industry: '游戏',
    scale: '1000-5000人',
    city: '上海',
    website: 'https://www.mihoyo.com',
    description: '米哈游是中国知名的游戏开发与发行公司，代表作包括《原神》《崩坏》系列。公司以"技术宅拯救世界"为理念，注重游戏品质和用户体验。',
    applicationCount: 1,
    candidateCount: 3,
    createdAt: '2026-03-20T15:00:00.000Z',
  },
  {
    id: 'company-7',
    name: 'PingCAP',
    industry: '企业服务',
    scale: '500-1000人',
    city: '北京',
    website: 'https://www.pingcap.com',
    description: 'PingCAP是一家开源数据库公司，核心产品TiDB是分布式关系型数据库。公司在开源社区有广泛影响力，服务全球数千家企业客户。',
    applicationCount: 0,
    candidateCount: 2,
    createdAt: '2026-04-10T08:30:00.000Z',
  },
  {
    id: 'company-8',
    name: '商汤科技',
    industry: '互联网/科技',
    scale: '5000-10000人',
    city: '上海',
    website: 'https://www.sensetime.com',
    description: '商汤科技是全球领先的人工智能公司，专注于计算机视觉和深度学习技术。业务涵盖智慧城市、智慧商业、智慧生活等多个领域。',
    applicationCount: 1,
    candidateCount: 5,
    createdAt: '2026-05-01T09:00:00.000Z',
  },
];

const MOCK_LINKED_APPLICATIONS: LinkedApplication[] = [
  { id: 'app-1', positionName: '高级前端工程师', status: '面试中', appliedDate: '2026-06-10' },
  { id: 'app-2', positionName: '技术专家', status: '投递中', appliedDate: '2026-06-15' },
  { id: 'app-3', positionName: '前端架构师', status: '已拿Offer', appliedDate: '2026-05-20' },
];

const MOCK_LINKED_CANDIDATES: LinkedCandidate[] = [
  { id: 'cand-1', name: '李明', position: '高级后端工程师', status: '面试中' },
  { id: 'cand-2', name: '王芳', position: '产品经理', status: '已录用' },
  { id: 'cand-3', name: '张伟', position: '数据分析师', status: '待筛选' },
  { id: 'cand-4', name: '刘洋', position: '算法工程师', status: '面试中' },
];

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function CompaniesPage() {
  const {
    data: companies,
    loading,
    create: apiCreate,
    update: apiUpdate,
    remove: apiRemove,
  } = useApiList<CompanyItem>({ endpoint: '/api/companies', mockData: MOCK_COMPANIES });
  const [searchText, setSearchText] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [form] = Form.useForm();

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);

  // ── Filtered companies ──
  const filteredCompanies = useMemo(() => {
    let result = companies;

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          (c.description ?? '').toLowerCase().includes(keyword)
      );
    }

    if (filterIndustry) {
      result = result.filter((c) => c.industry === filterIndustry);
    }

    if (filterCity) {
      result = result.filter((c) => c.city === filterCity);
    }

    return result;
  }, [companies, searchText, filterIndustry, filterCity]);

  // ── Stats ──
  const industryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of companies) {
      if (c.industry) {
        counts[c.industry] = (counts[c.industry] ?? 0) + 1;
      }
    }
    return counts;
  }, [companies]);

  // ── Modal handlers ──
  const openCreateModal = () => {
    setEditingCompany(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item: CompanyItem) => {
    setEditingCompany(item);
    form.setFieldsValue({
      name: item.name,
      industry: item.industry ?? undefined,
      scale: item.scale ?? undefined,
      city: item.city ?? undefined,
      website: item.website ?? undefined,
      description: item.description ?? undefined,
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      const payload = {
        name: values.name,
        industry: values.industry ?? null,
        scale: values.scale ?? null,
        city: values.city ?? null,
        website: values.website ?? null,
        description: values.description ?? null,
      };

      if (editingCompany) {
        await apiUpdate(editingCompany.id, payload as any);
        message.success('公司信息已更新');
      } else {
        await apiCreate(payload as any);
        message.success('公司已创建');
      }
      setModalOpen(false);
    } catch {
      // validation error
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (item: CompanyItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除公司「${item.name}」吗？关联的求职记录和候选人信息不会被删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        apiRemove(item.id);
        message.success('公司已删除');
      },
    });
  };

  // ── Drawer handler ──
  const openDrawer = (item: CompanyItem) => {
    setSelectedCompany(item);
    setDrawerOpen(true);
  };

  // ── Drawer tables ──
  const applicationColumns: ColumnsType<LinkedApplication> = [
    {
      title: '岗位名称',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === '面试中' ? 'orange' : status === '已拿Offer' ? 'green' : 'blue';
        return <Tag color={color} style={{ borderRadius: 8 }}>{status}</Tag>;
      },
    },
    {
      title: '投递日期',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date: string | null) => date ?? '-',
    },
  ];

  const candidateColumns: ColumnsType<LinkedCandidate> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '应聘岗位',
      dataIndex: 'position',
      key: 'position',
      render: (pos: string | null) => pos ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === '已录用' ? 'green' : status === '面试中' ? 'orange' : 'default';
        return <Tag color={color} style={{ borderRadius: 8 }}>{status}</Tag>;
      },
    },
  ];

  // ── Render ──
  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            公司库
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            管理关注和合作的公司信息，追踪关联的求职记录和候选人数据
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 8 }} onClick={openCreateModal}>
          新增公司
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card
            size="small"
            style={{ borderRadius: 8, textAlign: 'center', borderTop: '3px solid #8b7cf0', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '10px 8px' } }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#8b7cf0' }}>{companies.length}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              公司总数
            </Text>
          </Card>
        </Col>
        {Object.entries(industryStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([industry, count]) => (
            <Col xs={12} sm={8} md={4} key={industry}>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  textAlign: 'center',
                  borderTop: `3px solid ${
                    industry === '互联网/科技'
                      ? '#8b7cf0'
                      : industry === '电商'
                      ? '#fa8c16'
                      : industry === '金融'
                      ? '#faad14'
                      : '#722ed1'
                  }`,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                }}
                styles={{ body: { padding: '10px 8px' } }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color:
                      industry === '互联网/科技'
                        ? '#8b7cf0'
                        : industry === '电商'
                        ? '#fa8c16'
                        : industry === '金融'
                        ? '#faad14'
                        : '#722ed1',
                  }}
                >
                  {count}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {industry}
                </Text>
              </Card>
            </Col>
          ))}
      </Row>

      {/* Toolbar */}
      <Card
        size="small"
        style={{ borderRadius: 8, marginBottom: 16, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Space wrap size={10}>
          <Input
            placeholder="搜索公司名称..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="行业筛选"
            allowClear
            style={{ width: 150, borderRadius: 8 }}
            value={filterIndustry}
            onChange={(v) => setFilterIndustry(v)}
            options={INDUSTRY_OPTIONS.map((i) => ({ label: i, value: i }))}
          />
          <Select
            placeholder="城市筛选"
            allowClear
            style={{ width: 130, borderRadius: 8 }}
            value={filterCity}
            onChange={(v) => setFilterCity(v)}
            options={CITY_OPTIONS.map((c) => ({ label: c, value: c }))}
          />
        </Space>
      </Card>

      {/* Company Cards */}
      {filteredCompanies.length === 0 && !loading ? (
        <Card style={{ borderRadius: 8, textAlign: 'center', padding: 40, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
          <Empty description="暂无公司数据，点击「新增公司」开始构建公司库" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCompanies.map((item) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 8, height: '100%', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
                styles={{ body: { padding: '20px 20px 16px' } }}
                onClick={() => openDrawer(item)}
                actions={[
                  <span key="edit" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>
                    <EditOutlined /> 编辑
                  </span>,
                  <span
                    key="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    style={{ color: '#ff4d4f' }}
                  >
                    删除
                  </span>,
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    {item.name}
                  </Title>
                  <Space size={6} wrap>
                    {item.industry && (
                      <Tag style={{ borderRadius: 8 }} color={INDUSTRY_COLOR_MAP[item.industry] ?? 'default'}>
                        {item.industry}
                      </Tag>
                    )}
                    {item.scale && <Tag style={{ borderRadius: 8 }}>{item.scale}</Tag>}
                    {item.city && (
                      <Tag icon={<EnvironmentOutlined />} color="default" style={{ borderRadius: 8 }}>
                        {item.city}
                      </Tag>
                    )}
                  </Space>
                </div>

                {item.website && (
                  <div style={{ marginBottom: 8 }}>
                    <Space size={4}>
                      <GlobalOutlined style={{ color: '#8b7cf0', fontSize: 13 }} />
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                        ellipsis
                      >
                        {item.website}
                      </Text>
                    </Space>
                  </div>
                )}

                {item.description && (
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ fontSize: 13, margin: '8px 0' }}
                  >
                    {item.description}
                  </Paragraph>
                )}

                <Divider style={{ margin: '12px 0 8px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={12}>
                    <Badge
                      count={`${item.applicationCount} 求职`}
                      style={{
                        backgroundColor: '#e6f4ff',
                        color: '#8b7cf0',
                        fontSize: 11,
                        boxShadow: 'none',
                      }}
                    />
                    <Badge
                      count={`${item.candidateCount} 候选人`}
                      style={{
                        backgroundColor: '#f6ffed',
                        color: '#52c41a',
                        fontSize: 11,
                        boxShadow: 'none',
                      }}
                    />
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={
          <Space>
            <GlobalOutlined />
            <span>{editingCompany ? '编辑公司' : '新增公司'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editingCompany ? '保存修改' : '创建'}
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="industry" label="行业">
                <Select
                  placeholder="选择行业"
                  allowClear
                  style={{ borderRadius: 8 }}
                  options={INDUSTRY_OPTIONS.map((i) => ({ label: i, value: i }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scale" label="规模">
                <Select
                  placeholder="选择规模"
                  allowClear
                  style={{ borderRadius: 8 }}
                  options={SCALE_OPTIONS.map((s) => ({ label: s, value: s }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="城市">
                <Select
                  placeholder="选择城市"
                  allowClear
                  style={{ borderRadius: 8 }}
                  options={CITY_OPTIONS.map((c) => ({ label: c, value: c }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label="官网">
                <Input placeholder="https://www.example.com" prefix={<GlobalOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="公司简介">
            <TextArea
              rows={4}
              placeholder="简要描述公司业务、文化和发展方向..."
              maxLength={1000}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Company Detail Drawer */}
      <Drawer
        title={
          selectedCompany ? (
            <Space>
              <GlobalOutlined />
              <span>{selectedCompany.name}</span>
            </Space>
          ) : (
            '公司详情'
          )
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
      >
        {selectedCompany && (
          <div>
            {/* Basic info */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                基本信息
              </Title>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    行业
                  </Text>
                  {selectedCompany.industry ? (
                    <Tag style={{ borderRadius: 8 }} color={INDUSTRY_COLOR_MAP[selectedCompany.industry] ?? 'default'}>
                      {selectedCompany.industry}
                    </Tag>
                  ) : (
                    <Text type="secondary">未设置</Text>
                  )}
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    规模
                  </Text>
                  <Text>{selectedCompany.scale ?? '未设置'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    <EnvironmentOutlined /> 城市
                  </Text>
                  <Text>{selectedCompany.city ?? '未设置'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    <GlobalOutlined /> 官网
                  </Text>
                  {selectedCompany.website ? (
                    <a href={selectedCompany.website} target="_blank" rel="noreferrer">
                      {selectedCompany.website}
                    </a>
                  ) : (
                    <Text type="secondary">未设置</Text>
                  )}
                </Col>
              </Row>
            </div>

            {selectedCompany.description && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  公司简介
                </Title>
                <Paragraph style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                  {selectedCompany.description}
                </Paragraph>
              </div>
            )}

            <Divider />

            {/* Linked applications */}
            <div style={{ marginBottom: 24 }}>
              <Space style={{ marginBottom: 12 }}>
                <FileTextOutlined />
                <Title level={5} style={{ margin: 0 }}>
                  关联求职记录
                </Title>
                <Badge
                  count={selectedCompany.applicationCount}
                  style={{ backgroundColor: '#8b7cf0' }}
                />
              </Space>
              {selectedCompany.applicationCount > 0 ? (
                <Table<LinkedApplication>
                  columns={applicationColumns}
                  dataSource={MOCK_LINKED_APPLICATIONS.slice(0, selectedCompany.applicationCount)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无关联求职记录"
                />
              )}
            </div>

            <Divider />

            {/* Linked candidates */}
            <div>
              <Space style={{ marginBottom: 12 }}>
                <TeamOutlined />
                <Title level={5} style={{ margin: 0 }}>
                  关联候选人
                </Title>
                <Badge
                  count={selectedCompany.candidateCount}
                  style={{ backgroundColor: '#52c41a' }}
                />
              </Space>
              {selectedCompany.candidateCount > 0 ? (
                <Table<LinkedCandidate>
                  columns={candidateColumns}
                  dataSource={MOCK_LINKED_CANDIDATES.slice(0, Math.min(selectedCompany.candidateCount, 4))}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无关联候选人"
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
