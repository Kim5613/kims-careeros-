'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  id: string;
  name: string;
  relationType: RelationType;
  company: string | null;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  notes: string | null;
  createdAt: string;
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
    phone: '138-0000-1234',
    email: 'liting@robertwalters.com',
    wechat: 'lt_headhunter',
    notes: '专注互联网行业高级岗位，手里有很多大厂机会。每月会主动推荐3-5个岗位。',
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterRelation, setFilterRelation] = useState<string | undefined>(undefined);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  const [form] = Form.useForm();

  // ── Fetch data ──
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacts');
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setContacts(
          data.map((item: Record<string, unknown>) => ({
            id: item.id as string,
            name: item.name as string,
            relationType: item.relationType as RelationType,
            company: ((item.companies as Record<string, unknown>[])?.[0]?.name as string) ?? null,
            phone: item.phone as string | null,
            email: item.email as string | null,
            wechat: item.wechat as string | null,
            notes: item.notes as string | null,
            createdAt: item.createdAt as string,
          }))
        );
      } else {
        setContacts(MOCK_CONTACTS);
      }
    } catch {
      setContacts(MOCK_CONTACTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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
        name: values.name,
        relationType: values.relationType,
        companyName: values.company ?? null,
        phone: values.phone ?? null,
        email: values.email ?? null,
        wechat: values.wechat ?? null,
        notes: values.notes ?? null,
      };

      try {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          message.success(editingContact ? '联系人已更新' : '联系人已创建');
          setModalOpen(false);
          fetchContacts();
          return;
        }
      } catch {
        // API unavailable
      }

      // Local fallback
      if (editingContact) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === editingContact.id
              ? {
                  ...c,
                  name: payload.name,
                  relationType: payload.relationType,
                  company: payload.companyName,
                  phone: payload.phone,
                  email: payload.email,
                  wechat: payload.wechat,
                  notes: payload.notes,
                }
              : c
          )
        );
        message.success('联系人已更新（本地）');
      } else {
        const newItem: ContactItem = {
          id: `local-${Date.now()}`,
          name: payload.name,
          relationType: payload.relationType,
          company: payload.companyName,
          phone: payload.phone,
          email: payload.email,
          wechat: payload.wechat,
          notes: payload.notes,
          createdAt: new Date().toISOString(),
        };
        setContacts((prev) => [newItem, ...prev]);
        message.success('联系人已创建（本地）');
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
        setContacts((prev) => prev.filter((c) => c.id !== item.id));
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
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
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
        <Tag color={RELATION_COLOR_MAP[type] ?? 'default'}>{type}</Tag>
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
              <MailOutlined style={{ color: '#1677ff' }} />
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
    <Row gutter={[16, 16]}>
      {filteredContacts.map((item) => (
        <Col xs={24} sm={12} lg={8} key={item.id}>
          <Card
            hoverable
            style={{ borderRadius: 12, height: '100%' }}
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
                      ? '#1677ff'
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
                  <Tag color={RELATION_COLOR_MAP[item.relationType] ?? 'default'} style={{ margin: 0 }}>
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
                  <MailOutlined style={{ color: '#1677ff' }} />
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
    <div style={{ padding: '0 4px' }}>
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
          <Title level={3} style={{ margin: 0 }}>
            人脉库
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            管理职业人脉关系，记录猎头、同行、前同事等重要联系人
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreateModal}>
          新增联系人
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card
            size="small"
            style={{ borderRadius: 8, textAlign: 'center', borderTop: '3px solid #1677ff' }}
            styles={{ body: { padding: '10px 8px' } }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{contacts.length}</div>
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
                borderRadius: 8,
                textAlign: 'center',
                borderTop: `3px solid ${
                  type === '猎头'
                    ? '#fa8c16'
                    : type === 'HR同行'
                    ? '#1677ff'
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
                      ? '#1677ff'
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
        style={{ borderRadius: 10, marginBottom: 16 }}
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
              style={{ width: 240 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="关系类型筛选"
              allowClear
              style={{ width: 140 }}
              value={filterRelation}
              onChange={(v) => setFilterRelation(v)}
              options={RELATION_TYPE_OPTIONS.map((t) => ({
                label: (
                  <Tag color={RELATION_COLOR_MAP[t]} style={{ margin: 0 }}>
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
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <br />
          <Text type="secondary" style={{ fontSize: 14 }}>
            暂无联系人数据，点击「新增联系人」开始构建你的人脉库
          </Text>
        </Card>
      ) : viewMode === 'card' ? (
        renderCardView()
      ) : (
        <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input placeholder="联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="relationType"
                label="关系类型"
                rules={[{ required: true, message: '请选择关系类型' }]}
              >
                <Select
                  options={RELATION_TYPE_OPTIONS.map((t) => ({
                    label: (
                      <Tag color={RELATION_COLOR_MAP[t]} style={{ margin: 0 }}>
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
            <Input placeholder="如：字节跳动" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="手机号码" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="电子邮箱" prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="wechat" label="微信">
                <Input placeholder="微信号" prefix={<WechatOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <TextArea
              rows={3}
              placeholder="记录与该联系人的关系背景、合作情况或其他备注..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
