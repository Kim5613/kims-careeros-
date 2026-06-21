'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Typography,
  Segmented,
  message,
  Empty,
  Spin,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

type ApplicationStatus =
  | '投递中'
  | '筛选中'
  | '面试中'
  | '已拿Offer'
  | '已入职'
  | '已拒绝';

type ApplicationSource = '招聘网站' | '猎头' | '内推' | '官网';

interface JobApplication {
  id: string;
  companyName: string;
  positionName: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: ApplicationStatus;
  source: ApplicationSource | null;
  appliedDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface ApplicationFormData {
  companyName: string;
  positionName: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: ApplicationStatus;
  source: ApplicationSource | undefined;
  appliedDate: Dayjs | null;
  notes: string | undefined;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const STATUS_OPTIONS: ApplicationStatus[] = [
  '投递中',
  '筛选中',
  '面试中',
  '已拿Offer',
  '已入职',
  '已拒绝',
];

const SOURCE_OPTIONS: ApplicationSource[] = ['招聘网站', '猎头', '内推', '官网'];

const STATUS_COLOR_MAP: Record<ApplicationStatus, string> = {
  投递中: 'blue',
  筛选中: 'cyan',
  面试中: 'orange',
  已拿Offer: 'green',
  已入职: 'purple',
  已拒绝: 'red',
};

const KANBAN_COLUMNS: { status: ApplicationStatus; color: string; bgColor: string }[] = [
  { status: '投递中', color: '#1677ff', bgColor: '#e6f4ff' },
  { status: '筛选中', color: '#13c2c2', bgColor: '#e6fffb' },
  { status: '面试中', color: '#fa8c16', bgColor: '#fff7e6' },
  { status: '已拿Offer', color: '#52c41a', bgColor: '#f6ffed' },
  { status: '已入职', color: '#722ed1', bgColor: '#f9f0ff' },
  { status: '已拒绝', color: '#ff4d4f', bgColor: '#fff2f0' },
];

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: 'mock-1',
    companyName: '字节跳动',
    positionName: '高级前端工程师',
    salaryMin: 35000,
    salaryMax: 50000,
    status: '面试中',
    source: '内推',
    appliedDate: '2026-06-10',
    notes: '二面已通过，等待终面安排',
    createdAt: '2026-06-10T08:00:00.000Z',
  },
  {
    id: 'mock-2',
    companyName: '阿里巴巴',
    positionName: 'P7 技术专家',
    salaryMin: 40000,
    salaryMax: 60000,
    status: '投递中',
    source: '招聘网站',
    appliedDate: '2026-06-15',
    notes: null,
    createdAt: '2026-06-15T09:30:00.000Z',
  },
  {
    id: 'mock-3',
    companyName: '美团',
    positionName: '后端技术负责人',
    salaryMin: 45000,
    salaryMax: 65000,
    status: '已拿Offer',
    source: '猎头',
    appliedDate: '2026-05-20',
    notes: 'Offer 薪资 55K，考虑中',
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'mock-4',
    companyName: '腾讯',
    positionName: '全栈开发工程师',
    salaryMin: 30000,
    salaryMax: 45000,
    status: '筛选中',
    source: '官网',
    appliedDate: '2026-06-12',
    notes: '简历已通过初筛，等待笔试',
    createdAt: '2026-06-12T14:00:00.000Z',
  },
  {
    id: 'mock-5',
    companyName: '拼多多',
    positionName: '架构师',
    salaryMin: 50000,
    salaryMax: 80000,
    status: '已拒绝',
    source: '猎头',
    appliedDate: '2026-05-05',
    notes: '工作强度过大，综合考虑后拒绝',
    createdAt: '2026-05-05T11:00:00.000Z',
  },
  {
    id: 'mock-6',
    companyName: '华为',
    positionName: '云原生技术专家',
    salaryMin: 38000,
    salaryMax: 55000,
    status: '已入职',
    source: '内推',
    appliedDate: '2026-04-01',
    notes: '已入职两周，团队氛围不错',
    createdAt: '2026-04-01T08:30:00.000Z',
  },
];

// ────────────────────────────────────────────
// Helper: Format salary display
// ────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '面议';
  const fmtK = (v: number) => `${(v / 1000).toFixed(0)}K`;
  if (min != null && max != null) return `${fmtK(min)} - ${fmtK(max)}`;
  if (min != null) return `${fmtK(min)} 起`;
  return `最高 ${fmtK(max!)}`;
}

// ────────────────────────────────────────────
// Sub-component: Kanban Card
// ────────────────────────────────────────────

function KanbanCard({
  app,
  onEdit,
}: {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
}) {
  return (
    <Card
      hoverable
      size="small"
      style={{
        borderRadius: 10,
        marginBottom: 10,
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
      styles={{ body: { padding: '14px 16px' } }}
      onClick={() => onEdit(app)}
    >
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 2 }}>
          {app.companyName}
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {app.positionName}
        </Text>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#52c41a',
          }}
        >
          {formatSalary(app.salaryMin, app.salaryMax)}
        </Text>
        <Tag color={STATUS_COLOR_MAP[app.status]} style={{ margin: 0 }}>
          {app.status}
        </Tag>
      </div>
      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {app.appliedDate ? `投递于 ${dayjs(app.appliedDate).format('YYYY-MM-DD')}` : '投递日期未知'}
        </Text>
        {app.source && (
          <Tag
            style={{ marginLeft: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px' }}
          >
            {app.source}
          </Tag>
        )}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────
// Sub-component: Kanban Column
// ────────────────────────────────────────────

function KanbanColumn({
  status,
  color,
  bgColor,
  apps,
  onEdit,
}: {
  status: ApplicationStatus;
  color: string;
  bgColor: string;
  apps: JobApplication[];
  onEdit: (app: JobApplication) => void;
}) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 200,
        maxWidth: 300,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '10px 10px 0 0',
          backgroundColor: bgColor,
          borderBottom: `2px solid ${color}`,
        }}
      >
        <Space size={6}>
          <Badge color={color} />
          <Text strong style={{ fontSize: 14 }}>
            {status}
          </Text>
        </Space>
        <Badge
          count={apps.length}
          style={{
            backgroundColor: color,
            fontSize: 12,
          }}
        />
      </div>
      <div
        style={{
          padding: '12px 10px',
          backgroundColor: '#fafafa',
          borderRadius: '0 0 10px 10px',
          minHeight: 120,
          maxHeight: 'calc(100vh - 380px)',
          overflowY: 'auto',
        }}
      >
        {apps.length > 0 ? (
          apps.map((app) => (
            <KanbanCard key={app.id} app={app} onEdit={onEdit} />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                暂无记录
              </Text>
            }
            style={{ marginTop: 24 }}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function JobSeekingPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterSource, setFilterSource] = useState<string | undefined>(undefined);
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [form] = Form.useForm<ApplicationFormData>();

  // ── Fetch data (with fallback to mock) ──

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setApplications(
          data.map((item: Record<string, unknown>) => ({
            id: item.id as string,
            companyName: (item.company as Record<string, unknown>)?.name as string ?? '未知公司',
            positionName: item.positionName as string,
            salaryMin: (item.salaryMin as number) ?? null,
            salaryMax: (item.salaryMax as number) ?? null,
            status: item.status as ApplicationStatus,
            source: item.source as ApplicationSource | null,
            appliedDate: item.appliedDate as string | null,
            notes: item.notes as string | null,
            createdAt: item.createdAt as string,
          }))
        );
      } else {
        // Fallback to mock data if API returns empty
        setApplications(MOCK_APPLICATIONS);
      }
    } catch {
      // API unavailable, use mock data
      setApplications(MOCK_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Filtered applications ──

  const filteredApplications = useMemo(() => {
    let result = applications;

    // Search filter
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (app) =>
          app.companyName.toLowerCase().includes(keyword) ||
          app.positionName.toLowerCase().includes(keyword)
      );
    }

    // Source filter
    if (filterSource) {
      result = result.filter((app) => app.source === filterSource);
    }

    // Date range filter
    if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
      const start = filterDateRange[0].startOf('day');
      const end = filterDateRange[1].endOf('day');
      result = result.filter((app) => {
        if (!app.appliedDate) return false;
        const d = dayjs(app.appliedDate);
        return d.isAfter(start) && d.isBefore(end);
      });
    }

    return result;
  }, [applications, searchText, filterSource, filterDateRange]);

  // ── Modal handlers ──

  const openCreateModal = () => {
    setEditingApp(null);
    form.resetFields();
    form.setFieldsValue({ status: '投递中' });
    setModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    form.setFieldsValue({
      companyName: app.companyName,
      positionName: app.positionName,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      status: app.status,
      source: app.source ?? undefined,
      appliedDate: app.appliedDate ? dayjs(app.appliedDate) : null,
      notes: app.notes ?? undefined,
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      const payload = {
        companyName: values.companyName,
        positionName: values.positionName,
        salaryMin: values.salaryMin ?? null,
        salaryMax: values.salaryMax ?? null,
        status: values.status,
        source: values.source ?? null,
        appliedDate: values.appliedDate ? values.appliedDate.toISOString() : null,
        notes: values.notes ?? null,
      };

      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          message.success(editingApp ? '更新成功' : '新增成功');
          setModalOpen(false);
          fetchApplications();
          return;
        }
      } catch {
        // API unavailable, fall through to local update
      }

      // Local fallback: update state directly
      if (editingApp) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === editingApp.id
              ? {
                  ...app,
                  companyName: payload.companyName,
                  positionName: payload.positionName,
                  salaryMin: payload.salaryMin,
                  salaryMax: payload.salaryMax,
                  status: payload.status,
                  source: payload.source,
                  appliedDate: payload.appliedDate,
                  notes: payload.notes,
                }
              : app
          )
        );
        message.success('更新成功（本地）');
      } else {
        const newApp: JobApplication = {
          id: `local-${Date.now()}`,
          companyName: payload.companyName,
          positionName: payload.positionName,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          status: payload.status,
          source: payload.source,
          appliedDate: payload.appliedDate,
          notes: payload.notes,
          createdAt: new Date().toISOString(),
        };
        setApplications((prev) => [newApp, ...prev]);
        message.success('新增成功（本地）');
      }
      setModalOpen(false);
    } catch {
      // Form validation failed — Ant Design shows inline errors
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (app: JobApplication) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除「${app.companyName} - ${app.positionName}」的求职记录吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
        message.success('已删除');
      },
    });
  };

  // ── Table columns ──

  const columns: ColumnsType<JobApplication> = [
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 140,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 180,
    },
    {
      title: '薪资范围',
      key: 'salary',
      width: 140,
      render: (_: unknown, record: JobApplication) => (
        <Text style={{ color: '#52c41a', fontWeight: 500 }}>
          {formatSalary(record.salaryMin, record.salaryMax)}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: ApplicationStatus) => (
        <Tag color={STATUS_COLOR_MAP[status]}>{status}</Tag>
      ),
      filters: STATUS_OPTIONS.map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string | null) => source ?? '-',
      filters: SOURCE_OPTIONS.map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.source === value,
    },
    {
      title: '投递日期',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      width: 120,
      render: (date: string | null) =>
        date ? dayjs(date).format('YYYY-MM-DD') : '-',
      sorter: (a, b) => {
        const da = a.appliedDate ? dayjs(a.appliedDate).valueOf() : 0;
        const db = b.appliedDate ? dayjs(b.appliedDate).valueOf() : 0;
        return da - db;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: JobApplication) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(record);
            }}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          />
        </Space>
      ),
    },
  ];

  // ── Render ──

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Header ── */}
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
            求职管理
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            追踪所有求职投递进度，管理面试状态与 Offer 记录
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openCreateModal}
        >
          新增求职记录
        </Button>
      </div>

      {/* ── Toolbar: Search + Filters + View Toggle ── */}
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
              placeholder="搜索公司或职位..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              allowClear
              style={{ width: 220 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="来源筛选"
              allowClear
              style={{ width: 130 }}
              value={filterSource}
              onChange={(v) => setFilterSource(v)}
              options={SOURCE_OPTIONS.map((s) => ({ label: s, value: s }))}
            />
            <DatePicker.RangePicker
              style={{ width: 260 }}
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) =>
                setFilterDateRange(dates as [Dayjs | null, Dayjs | null] | null)
              }
            />
          </Space>
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as 'kanban' | 'table')}
            options={[
              {
                value: 'kanban',
                icon: <AppstoreOutlined />,
                label: '看板',
              },
              {
                value: 'table',
                icon: <TableOutlined />,
                label: '列表',
              },
            ]}
          />
        </div>
      </Card>

      {/* ── Stats Summary ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {KANBAN_COLUMNS.map(({ status, color }) => {
          const count = filteredApplications.filter((a) => a.status === status).length;
          return (
            <Col key={status} xs={12} sm={8} md={4}>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  borderTop: `3px solid ${color}`,
                  textAlign: 'center',
                }}
                styles={{ body: { padding: '10px 8px' } }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {status}
                </Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ── Content: Kanban or Table ── */}
      <Spin spinning={loading}>
        {filteredApplications.length === 0 && !loading ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
            <Empty description="暂无求职记录，点击「新增求职记录」开始追踪你的求职进度" />
          </Card>
        ) : viewMode === 'kanban' ? (
          /* ── Kanban Board ── */
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 16,
            }}
          >
            {KANBAN_COLUMNS.map(({ status, color, bgColor }) => (
              <KanbanColumn
                key={status}
                status={status}
                color={color}
                bgColor={bgColor}
                apps={filteredApplications.filter((a) => a.status === status)}
                onEdit={openEditModal}
              />
            ))}
          </div>
        ) : (
          /* ── Table View ── */
          <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
            <Table<JobApplication>
              columns={columns}
              dataSource={filteredApplications}
              rowKey="id"
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
      </Spin>

      {/* ── Create / Edit Modal ── */}
      <Modal
        title={
          <Space>
            {editingApp ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingApp ? '编辑求职记录' : '新增求职记录'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editingApp ? '保存修改' : '保存'}
        cancelText="取消"
        width={580}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: '投递中' }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="companyName"
                label="公司名称"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="如：字节跳动" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="positionName"
                label="职位名称"
                rules={[{ required: true, message: '请输入职位名称' }]}
              >
                <Input placeholder="如：高级前端工程师" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="salaryMin"
                label="薪资下限（月薪）"
              >
                <InputNumber
                  placeholder="最低月薪"
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="salaryMax"
                label="薪资上限（月薪）"
              >
                <InputNumber
                  placeholder="最高月薪"
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="status"
                label="当前状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  options={STATUS_OPTIONS.map((s) => ({
                    label: (
                      <Tag color={STATUS_COLOR_MAP[s]} style={{ margin: 0 }}>
                        {s}
                      </Tag>
                    ),
                    value: s,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ApplicationFormData>
                name="source"
                label="来源渠道"
              >
                <Select
                  placeholder="选择来源"
                  allowClear
                  options={SOURCE_OPTIONS.map((s) => ({ label: s, value: s }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item<ApplicationFormData>
            name="appliedDate"
            label="投递日期"
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择投递日期" />
          </Form.Item>

          <Form.Item<ApplicationFormData>
            name="notes"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="记录面试进展、薪资情况或其他备注..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
