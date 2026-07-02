'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  Tabs,
  Empty,
  message,
  Segmented,
  Row,
  Col,
  Avatar,
  List,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  WechatOutlined,
  TeamOutlined,
  TableOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

type RelationType = '猎头' | 'HR同行' | '前同事' | '面试官' | '用人部门';

interface ContactItem {
  id: string; name: string; relationType: RelationType;
  company: string | null; phone: string | null; email: string | null; wechat: string | null;
  tags?: string[]; lastInteractionDate?: string | null; interactionFrequency?: string | null;
  notes: string | null; createdAt: string;
  interactions?: { id: string; date: string; content: string }[];
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const RELATION_TYPE_OPTIONS: RelationType[] = ['猎头', 'HR同行', '前同事', '面试官', '用人部门'];

const RELATION_COLOR_MAP: Record<string, string> = {
  '猎头': 'orange',
  'HR同行': 'blue',
  '前同事': 'green',
  '面试官': 'purple',
  '用人部门': 'red',
};

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_CONTACTS: ContactItem[] = [
  {
    id: 'contact-1',
    name: '李婷',
    relationType: '猎头',
    company: '罗伯特·沃尔特斯',
    phone: '138-0000-1234', email: 'liting@robertwalters.com', wechat: 'lt_headhunter',
    tags: ['技术方向', '大厂机会', '靠谱'], lastInteractionDate: '2026-06-20', interactionFrequency: 'monthly',
    notes: '专注互联网行业高级岗位，手里有很多大厂机会。',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'contact-2',
    name: '王磊',
    relationType: 'HR同行',
    company: '字节跳动',
    phone: '139-0000-5678',
    email: 'wanglei.hr@bytedance.com',
    wechat: 'wl_hr_byte',
    notes: '字节HRBP，负责技术团队招聘。可以互相交流市场行情和面试方法。',
    createdAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'contact-3',
    name: '陈浩',
    relationType: '前同事',
    company: '美团',
    phone: '137-0000-9012',
    email: 'chenhao@meituan.com',
    wechat: 'chenhao_dev',
    notes: '前公司同组后端工程师，现已跳槽到美团。技术能力很强，可内推。',
    createdAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'contact-4',
    name: '赵雪',
    relationType: '面试官',
    company: '阿里巴巴',
    phone: '136-0000-3456',
    email: 'zhaoxue@alibaba.com',
    wechat: null,
    notes: '阿里P8技术面试官，在技术社区活动中认识。面试风格注重系统设计能力。',
    createdAt: '2026-04-05T16:00:00.000Z',
  },
  {
    id: 'contact-5',
    name: '刘芳',
    relationType: '用人部门',
    company: '腾讯',
    phone: '135-0000-7890',
    email: 'liufang@tencent.com',
    wechat: 'lf_tencent_mgr',
    notes: '腾讯某业务线技术总监，正在招前端架构师。通过猎头介绍认识，有过一次深入沟通。',
    createdAt: '2026-05-12T11:00:00.000Z',
  },
  {
    id: 'contact-6',
    name: '张明远',
    relationType: '猎头',
    company: 'Michael Page',
    phone: '188-0000-2345',
    email: 'zhangmy@michaelpage.com',
    wechat: 'zmy_page',
    notes: 'Michael Page资深顾问，主攻技术管理层岗位。沟通效率高，推荐岗位质量不错。',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
];

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

interface CandidateItem {
  id: string; name: string; position: string; company: string;
  status: string; talentPoolTag: boolean; createdAt: string;
}

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<string>('contacts');
  const {
    data: contacts, loading, create: apiCreate, update: apiUpdate, remove: apiRemove,
  } = useApiList<ContactItem>({ endpoint: '/api/contacts', mockData: MOCK_CONTACTS });
  const { data: candidates } = useApiList<CandidateItem>({ endpoint: '/api/candidates', mockData: [] });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterRelation, setFilterRelation] = useState<string | undefined>(undefined);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  const [form] = Form.useForm();

  // ── Filtered contacts ──
  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          (c.company ?? '').toLowerCase().includes(keyword) ||
          (c.notes ?? '').toLowerCase().includes(keyword)
      );
    }

    if (filterRelation) {
      result = result.filter((c) => c.relationType === filterRelation);
    }

    return result;
  }, [contacts, searchText, filterRelation]);

  // ── Relation type stats ──
  const relationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contacts) {
      counts[c.relationType] = (counts[c.relationType] ?? 0) + 1;
    }
    return counts;
  }, [contacts]);

  // ── Modal handlers ──
  const openCreateModal = () => {
    setEditingContact(null);
    form.resetFields();
    form.setFieldsValue({ relationType: '猎头' });
    setModalOpen(true);
  };

  const openEditModal = (item: ContactItem) => {
    setEditingContact(item);
    form.setFieldsValue({
      name: item.name,
      relationType: item.relationType,
      company: item.company ?? undefined,
      phone: item.phone ?? undefined,
      email: item.email ?? undefined,
      wechat: item.wechat ?? undefined,
      notes: item.notes ?? undefined,
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      const payload = {
        name: values.name, relationType: values.relationType,
        companyName: values.company ?? null,
        phone: values.phone ?? null, email: values.email ?? null, wechat: values.wechat ?? null,
        tags: values.tags || [], lastInteractionDate: values.lastInteractionDate || null,
        interactionFrequency: values.interactionFrequency || null, notes: values.notes ?? null,
      };

      if (editingContact) {
        await apiUpdate(editingContact.id, payload as any);
        message.success('联系人已更新');
      } else {
        await apiCreate(payload as any);
        message.success('联系人已创建');
      }
      setModalOpen(false);
    } catch {
      // validation error
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (item: ContactItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除联系人「${item.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        apiRemove(item.id);
        message.success('联系人已删除');
      },
    });
  };

  // ── Table columns ──
  const columns: ColumnsType<ContactItem> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#8b7cf0' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '关系类型',
      dataIndex: 'relationType',
      key: 'relationType',
      width: 110,
      render: (type: string) => (
        <Tag color={RELATION_COLOR_MAP[type] ?? 'default'} style={{ borderRadius: 14 }}>{type}</Tag>
      ),
      filters: RELATION_TYPE_OPTIONS.map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.relationType === value,
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      width: 160,
      render: (company: string | null) => company ?? '-',
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 240,
      render: (_: unknown, record: ContactItem) => (
        <Space direction="vertical" size={2}>
          {record.phone && (
            <Space size={4}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 13 }}>{record.phone}</Text>
            </Space>
          )}
          {record.email && (
            <Space size={4}>
              <MailOutlined style={{ color: '#8b7cf0' }} />
              <Text style={{ fontSize: 13 }}>{record.email}</Text>
            </Space>
          )}
          {record.wechat && (
            <Space size={4}>
              <WechatOutlined style={{ color: '#07c160' }} />
              <Text style={{ fontSize: 13 }}>{record.wechat}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 160,
      render: (tags: string[]) => tags && tags.length > 0 ? <Space size={2} wrap>{tags.map((t: string) => <Tag key={t} style={{ fontSize: 11, borderRadius: 14 }}>{t}</Tag>)}</Space> : '-',
    },
    {
      title: '上次互动',
      dataIndex: 'lastInteractionDate',
      key: 'lastInteractionDate',
      width: 100,
      render: (d: string | null) => {
        if (!d) return <Text type="secondary">-</Text>;
        const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
        return <Tag color={days > 180 ? 'red' : days > 90 ? 'orange' : 'green'} style={{ borderRadius: 14 }}>{d}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string | null) =>
        notes ? (
          <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, fontSize: 13, color: '#888' }}>
            {notes}
          </Paragraph>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: ContactItem) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<UserOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // ── Card view renderer ──
  const renderCardView = () => (
    <Row gutter={[14, 14]}>
      {filteredContacts.map((item) => (
        <Col xs={24} sm={12} lg={8} key={item.id}>
          <Card
            hoverable
            style={{ borderRadius: 20, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            styles={{ body: { padding: '20px 20px 16px' } }}
            onClick={() => openEditModal(item)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <Avatar
                size={48}
                icon={<UserOutlined />}
                style={{
                  backgroundColor:
                    item.relationType === '猎头'
                      ? '#fa8c16'
                      : item.relationType === 'HR同行'
                      ? '#8b7cf0'
                      : item.relationType === '前同事'
                      ? '#52c41a'
                      : item.relationType === '面试官'
                      ? '#722ed1'
                      : '#ff4d4f',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {item.name}
                  </Title>
                  <Tag color={RELATION_COLOR_MAP[item.relationType] ?? 'default'} style={{ margin: 0, borderRadius: 14 }}>
                    {item.relationType}
                  </Tag>
                </div>
                {item.company && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {item.company}
                  </Text>
                )}
              </div>
            </div>

            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {item.phone && (
                <Space size={8}>
                  <PhoneOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ fontSize: 13 }}>{item.phone}</Text>
                </Space>
              )}
              {item.email && (
                <Space size={8}>
                  <MailOutlined style={{ color: '#8b7cf0' }} />
                  <Text style={{ fontSize: 13 }} ellipsis>{item.email}</Text>
                </Space>
              )}
              {item.wechat && (
                <Space size={8}>
                  <WechatOutlined style={{ color: '#07c160' }} />
                  <Text style={{ fontSize: 13 }}>{item.wechat}</Text>
                </Space>
              )}
            </Space>

            {item.notes && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ fontSize: 12, margin: 0 }}
                >
                  {item.notes}
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  // ── Render ──
  return (
    <div style={{ padding: '20px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            人脉库
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            管理职业人脉关系，记录猎头、同行、前同事等重要联系人
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreateModal} style={{ borderRadius: 20 }}>
          新增联系人
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'contacts', label: '联系人' },
        { key: 'candidates', label: '候选人' },
      ]} style={{ marginBottom: 8 }} />

      {activeTab === 'contacts' && (<>
      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 14 }}>
        <Col xs={12} sm={8} md={4}>
          <Card
            size="small"
            style={{ borderRadius: 14, textAlign: 'center', borderTop: '3px solid #8b7cf0' }}
            styles={{ body: { padding: '10px 8px' } }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#8b7cf0' }}>{contacts.length}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              全部联系人
            </Text>
          </Card>
        </Col>
        {RELATION_TYPE_OPTIONS.map((type) => (
          <Col xs={12} sm={8} md={4} key={type}>
            <Card
              size="small"
              style={{
                borderRadius: 14,
                textAlign: 'center',
                borderTop: `3px solid ${
                  type === '猎头'
                    ? '#fa8c16'
                    : type === 'HR同行'
                    ? '#8b7cf0'
                    : type === '前同事'
                    ? '#52c41a'
                    : type === '面试官'
                    ? '#722ed1'
                    : '#ff4d4f'
                }`,
              }}
              styles={{ body: { padding: '10px 8px' } }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color:
                    type === '猎头'
                      ? '#fa8c16'
                      : type === 'HR同行'
                      ? '#8b7cf0'
                      : type === '前同事'
                      ? '#52c41a'
                      : type === '面试官'
                      ? '#722ed1'
                      : '#ff4d4f',
                }}
              >
                {relationStats[type] ?? 0}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {type}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Toolbar */}
      <Card
        size="small"
        style={{ borderRadius: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Space wrap size={10}>
            <Input
              placeholder="搜索姓名、公司或备注..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              allowClear
              style={{ width: 240, borderRadius: 14 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="关系类型筛选"
              allowClear
              style={{ width: 140, borderRadius: 14 }}
              value={filterRelation}
              onChange={(v) => setFilterRelation(v)}
              options={RELATION_TYPE_OPTIONS.map((t) => ({
                label: (
                  <Tag color={RELATION_COLOR_MAP[t]} style={{ margin: 0, borderRadius: 14 }}>
                    {t}
                  </Tag>
                ),
                value: t,
              }))}
            />
          </Space>
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as 'table' | 'card')}
            options={[
              { value: 'card', icon: <AppstoreOutlined />, label: '卡片' },
              { value: 'table', icon: <TableOutlined />, label: '列表' },
            ]}
          />
        </div>
      </Card>

      {/* Content */}
      {filteredContacts.length === 0 && !loading ? (
        <Card style={{ borderRadius: 20, textAlign: 'center', padding: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <br />
          <Text type="secondary" style={{ fontSize: 14 }}>
            暂无联系人数据，点击「新增联系人」开始构建你的人脉库
          </Text>
        </Card>
      ) : viewMode === 'card' ? (
        renderCardView()
      ) : (
        <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} styles={{ body: { padding: 0 } }}>
          <Table<ContactItem>
            columns={columns}
            dataSource={filteredContacts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            size="middle"
            onRow={(record) => ({
              onClick: () => openEditModal(record),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>
      )}
      </>)}

      {activeTab === 'candidates' && (
        <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={candidates}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 位候选人` }}
            columns={[
              { title: '姓名', dataIndex: 'name', key: 'name', width: 100, render: (n: string) => <Text strong>{n}</Text> },
              { title: '职位', dataIndex: 'position', key: 'position', width: 140, render: (p: string) => p || '-' },
              { title: '公司', dataIndex: 'company', key: 'company', width: 140, render: (c: any) => typeof c === 'string' ? c : c?.name || '-' },
              { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={s === '已发Offer' ? 'green' : s === '面试中' ? 'orange' : s === '待筛选' ? 'blue' : 'default'} style={{ borderRadius: 14 }}>{s || '-'}</Tag> },
              { title: '人才库', dataIndex: 'talentPoolTag', key: 'talentPoolTag', width: 80, render: (t: boolean) => t ? <Tag color="gold" style={{ borderRadius: 14 }}>★ 人才库</Tag> : null },
              { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '-' },
            ]}
            locale={{ emptyText: <Empty description="暂无候选人" /> }}
          />
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>{editingContact ? '编辑联系人' : '新增联系人'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editingContact ? '保存修改' : '保存'}
        cancelText="取消"
        width={580}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ relationType: '猎头' }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input placeholder="联系人姓名" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="relationType"
                label="关系类型"
                rules={[{ required: true, message: '请选择关系类型' }]}
              >
                <Select
                  style={{ borderRadius: 14 }}
                  options={RELATION_TYPE_OPTIONS.map((t) => ({
                    label: (
                      <Tag color={RELATION_COLOR_MAP[t]} style={{ margin: 0, borderRadius: 14 }}>
                        {t}
                      </Tag>
                    ),
                    value: t,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="company" label="所在公司">
            <Input placeholder="如：字节跳动" style={{ borderRadius: 14 }} />
          </Form.Item>

          <Row gutter={14}>
            <Col span={8}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="手机号码" prefix={<PhoneOutlined />} style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="电子邮箱" prefix={<MailOutlined />} style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="wechat" label="微信">
                <Input placeholder="微信号" prefix={<WechatOutlined />} style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入后回车添加，如：技术方向、高潜、可内推" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item name="lastInteractionDate" label="上次互动">
                <Input placeholder="2026-06-01" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="interactionFrequency" label="联系频率">
                <Select allowClear placeholder="选填" style={{ borderRadius: 14 }} options={[
                  { label: '每月', value: 'monthly' },
                  { label: '每季度', value: 'quarterly' },
                  { label: '每半年', value: 'halfYearly' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="备注信息..." maxLength={500} showCount style={{ borderRadius: 14 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
